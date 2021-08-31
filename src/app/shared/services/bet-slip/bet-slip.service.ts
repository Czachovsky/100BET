import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';
import {BetSlip, NewPick} from '../../interfaces/pick'
import {SubscriptionsService} from "../subscriptions/subscriptions.service";
import * as _ from "lodash";
import { WebsocketService } from '../websocket/websocket.service';
import { AuthService } from '../auth/auth.service';
import { Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BetSlipService {
  private renderer: Renderer2;
  isReady: boolean;
  betSlip: BetSlip;
  pick: NewPick;
  picksNumber: number;
  picksRid: any = [];
  pickedSubscription: Subscription;
  betRef: any;
  constructor(private subscriptionsService: SubscriptionsService,
              private websocketService:  WebsocketService,
              private auth: AuthService,
              rendererFactory: RendererFactory2) {
    this.renderer = rendererFactory.createRenderer(null, null);
  }


  initNewBetSlip(fresh?): object {
    if (localStorage.getItem('betSlip_cart') && !fresh) {
      this.betSlip = JSON.parse(localStorage.getItem('betSlip_cart'));
      return JSON.parse(localStorage.getItem('betSlip_cart'));
    } else {
      this.betSlip = Object.assign({}, {
        multi_stake: '',
        bankerEnabled: false,
        email_notification: false,
        sms_notification: false,
        type: ["single"],
        odds_option: "No",
        multiples: [],
        system: [],
        possible_return_single: 0,
        possible_return_multi: 0,
        possible_return_system: 0,
        picks: [],
        additionalPicks: [],
        total_odds: 0,
        stake_all: 0,
        isConflict: false
      })
      localStorage.setItem('betSlip_cart', JSON.stringify(this.betSlip));
      return this.betSlip;
    }
  }

  addPickToBetSlip(betSlipObject) {
    this.betSlip.picks.push(betSlipObject);
    this.calculatePossibleReturn();
    this.calculateTotalStake();
    this.checkForConflicts(this.betSlip.picks);
    this.setNewObjectToLocalStorage(this.betSlip);
     this.subscriptionsService.triggerBetSlipChanges(true);
  }

  resetBetslipState(){
    this.betSlip.multi_stake = '';
    this.betSlip.possible_return_multi = 0;
    this.betSlip.possible_return_single = 0;
    this.betSlip.possible_return_system = 0;
    this.betSlip.stake_all = 0;
    this.betSlip.total_odds = 0;
    this.betSlip.type = ['single'];
    this.betSlip.multiples = [];
  }

  removePickFromBetSlip(pickId: string) {
    const tempObj = this.getBetSlipFromLocalStorage();
    tempObj['picks'] = [...tempObj['picks'].filter(item => item['eventId'] !== pickId)];
    this.betSlip = Object.assign({}, tempObj);
    this.calculatePossibleReturn();
    this.calculateTotalStake();
    this.checkForConflicts(this.betSlip.picks);
    if(this.betSlip.picks.length < 2){
      this.betSlip.type = ['single'];
      this.betSlip.system = [];
      this.betSlip.multiples = [];
    }
    if(!this.betSlip.picks.length){
        this.subscriptionsService.setbetCount(0);
        this.resetBetslipState();
        this.renderer.removeClass(document.getElementsByTagName( 'html' )[0], 'betslip_open');
    }
    this.setNewObjectToLocalStorage(this.betSlip);
     this.subscriptionsService.triggerBetSlipChanges(true);
  }

  changeSetSlipObject(what, newVal) {
    this.betSlip[what] = newVal;
    this.calculatePossibleReturn();
    this.calculateTotalStake();
    this.checkForConflicts(this.betSlip.picks);
    this.setNewObjectToLocalStorage(this.betSlip);
    this.subscriptionsService.triggerBetSlipChangesButDoNotSubscribeAgain(true);
  }

  removeAllFromBetSlip(subId, noSub?){
    this.betSlip.picks = [];
    this.resetBetslipState();
    this.setNewObjectToLocalStorage(this.betSlip);
    this.subscriptionsService.triggerBetSlipChanges(true);
    this.renderer.removeClass(document.getElementsByTagName( 'html' )[0], 'betslip_open');
    if(!noSub){
      this.websocketService.sendMessage({
        "command": "unsubscribe",
        "params": {
          "subid": subId
        }
      });
    }
  }

  setNewObjectToLocalStorageAndCalculateAll(object) {
    this.calculatePossibleReturn();
    this.calculateTotalStake();
    this.checkForConflicts(this.betSlip.picks);
    localStorage.setItem('betSlip_cart', JSON.stringify(object));
    this.subscriptionsService.triggerBetSlipChangesButDoNotSubscribeAgain(true);
  }

  getBetSlipFromLocalStorage() {
    return JSON.parse(localStorage.getItem('betSlip_cart'));
  }

  setNewObjectToLocalStorage(object) {
    localStorage.setItem('betSlip_cart', JSON.stringify(object));
  }

  checkPickIfIsInCart(fromBackend, fromLocalstorage) {
    const tempArr1 = fromLocalstorage.picks.map((e) => e.option_id);
    fromBackend.filter((e) => {
      return e.picks.filter((el) => {
        if (tempArr1.includes(el.id)) {
          el.inCart = true;
        } else {
          el.inCart = false;
        }
      })
    })
    return fromBackend;
  }

  getArrayOfPicks(){
    const arr = [];
    this.getBetSlipFromLocalStorage().picks.forEach(e => {
      arr.push(e.eventId);
    });
    return arr;
  }

  calculatePossibleWinForEachPicks(){
    this.betSlip.picks.map((e) => {
      if(e.stake !== ''){
        e.possibleWin = e.stake * e.price;
      } else {
        e.possibleWin = 0;
      }
    });
  }

  calculatePossibleReturn(){
    this.calculatePossibleWinForEachPicks();
    let possibleWin = 0;
    let total_odds = 1;
    this.betSlip.picks.map((e) => {
      if(e.selected){
        possibleWin += e.possibleWin;
        total_odds = total_odds * e.price
      }
    });
    this.betSlip.total_odds = total_odds;
    this.betSlip.possible_return_single = possibleWin;
    if(this.betSlip.system.length){
      let price = 0;
      this.betSlip.system.map(f => {
        price = price + f.possible_return;
      })
      this.betSlip.possible_return_system = price;
    }
    if(this.betSlip.multi_stake && Number(this.betSlip.multi_stake) > 0){
      this.betSlip.possible_return_multi = Number(this.betSlip.multi_stake) * Number(this.betSlip.total_odds)
    }
  }

  calculateTotalStake(){
    let total = 0;
    this.betSlip.picks.map((e) => {
      if(e.stake !== '' && e.stake !== 'NaN'){
        total = total + parseFloat(e.stake);
      }
    })
    if(this.betSlip.multi_stake !== 'NaN' && this.betSlip.multi_stake !== '' && this.betSlip.multi_stake){
      total = total + parseFloat(this.betSlip.multi_stake)
    }
    if(this.betSlip.multiples.length){
      let _temp = 0;
      this.betSlip.multiples.map((e) => {
        _temp = _temp + parseFloat(e.stake);
      });
      total = total + _temp;
    }
    if(this.betSlip.system.length){
      let __temp = 0;
      this.betSlip.system.map((e) => {
        __temp = __temp + parseFloat(e.price);
      });
      total = total + __temp;
    }
    this.betSlip.stake_all = total;
    this.setNewObjectToLocalStorage(this.betSlip);
  }

  updateBetslipBC(oldObject, newObject){
    let objectToSend = {};
    const tempBetSlip = this.getBetSlipFromLocalStorage();
    objectToSend = Object.assign({}, _.mergeWith({}, oldObject, newObject, (a,b)=>b === null ? a : undefined));
    tempBetSlip.picks.map(e => {
      if(objectToSend[e.gameId]){
        e['isChanged'] = e['price'] > objectToSend[e.gameId].market[e.marketId].event[e.eventId].price || e['price'] < objectToSend[e.gameId].market[e.marketId].event[e.eventId].price;
        e['isUp'] = e['price'] > objectToSend[e.gameId].market[e.marketId].event[e.eventId].price ;
        e['isDown'] = e['price'] < objectToSend[e.gameId].market[e.marketId].event[e.eventId].price ;
        e['price'] = objectToSend[e.gameId].market[e.marketId].event[e.eventId].price;
        e['isBlocked'] = objectToSend[e.gameId].is_blocked || newObject[e.gameId] === null;
        if(objectToSend[e.gameId].is_blocked){
          e['selected'] = false;
        }
      } else {
        e['isBlocked'] = 1;
        e['selected'] = false;
      }
    });
    this.calculatePossibleWinForEachPicks();
    this.calculatePossibleReturn();
    this.calculateTotalStake();
    this.checkForConflicts(this.betSlip.picks);
    this.setNewObjectToLocalStorage(tempBetSlip);
    this.checkBlockedOrDeletedEvents();
    this.subscriptionsService.triggerBetSlipChangesButDoNotSubscribeAgain(true);
    this.subscriptionsService.setBetSlipUpdateFromBC(true);
   // return objectToSend;
  }

  deleteSpecificPick(id){
      const tempObj = this.getBetSlipFromLocalStorage();
      tempObj['picks'] = tempObj['picks'].filter(item => item['marketId'] !== id);
      this.setNewObjectToLocalStorage(tempObj);
  }

  checkForConflicts(picks){
    const tempPicks = _.map(picks, (o,i) => {
      const eq = _.find(picks, (e,ind)=>{
        if(i !== ind){
          return (_.isEqual(e.gameId, o.gameId) && _.isEqual(e.expressId, o.expressId))
        }
      })
      if(eq){
        o.isConflict = true;
        return o;
      } else {
        o.isConflict = false;
        return o;
      }
    })
    tempPicks.filter(e => e.isConflict).length ? this.betSlip.isConflict = true : this.betSlip.isConflict = false;
    this.betSlip.picks = [...tempPicks];
    this.setNewObjectToLocalStorage(this.betSlip);
  }

  checkUserBalance(){
      if(this.auth.isLoggedIn){
        let userBalance = 0;
         userBalance = this.auth.userInfoObject['balance'];
        let fullCost = 0;
        this.betSlip.picks.map(e => {
          if(e.stake !== ''){
            fullCost = fullCost + parseFloat(e.stake);
          }
        });
        if(!isNaN(fullCost)){
          if((userBalance >= fullCost)){
            this.subscriptionsService.setIfBalanceError(false);
          } else {
            this.subscriptionsService.setIfBalanceError(true);
          }
        }
      }
  }

  checkBlockedOrDeletedEvents(){
    if(this.betSlip.picks.filter(e => e.isBlocked).length){
      this.subscriptionsService.setIfBlockedOrDeleted(true);
    } else {
      this.subscriptionsService.setIfBlockedOrDeleted(false);
    }
  }

  placeBet(picks: Array<any>, conflict?) {
    const betType = this.betSlip.type;
    this.picksNumber = picks.length;
    if(betType.includes('single')){
      picks.forEach(e => {
        if(e.stake && e.stake !== '' && e.stake !== 'NaN' && Number(e.stake) > 0){
          const params = {
            'type': 1,
            'mode': 2,
            'amount': e.stake,
            'bets': [
              {
                'event_id': e.eventId,
                'price': e.price
              }
            ]
          }
          if(e.selectedFreeBet){
            params['bonus_id'] = e.selectedFreeBetId
          }
          this.websocketService.sendMessage({
            'command': 'do_bet',
            'params': params,
            'rid': `placing-bet-${e.eventId}`
          });
          this.picksRid.push(`placing-bet-${e.eventId}`);
        }
      });
    }
    if((betType.includes('multi') && !conflict) || (this.betSlip.multi_stake && this.betSlip.multi_stake !== '' && Number(this.betSlip.multi_stake) > 0 && !conflict)  ){
      const multiObject = [];
      picks.forEach(e => {
        multiObject.push({
          'event_id': e.eventId,
          'price': e.price
        })
      });
      const params = {
        'type': 2,
        'mode': 2,
        "each_way": false,
        'amount': this.getBetSlipFromLocalStorage()['multi_stake'],
        'bets': multiObject,
      }
      if(this.betSlip['freeBetMultiSelected']){
        params['bonus_id'] = this.betSlip['selectedFreeBetMultiId'];
      }
        this.websocketService.sendMessage({
          'command': 'do_bet',
          'params': params,
          'rid': `placing-bet-multi`
        });
        this.picksRid.push(`placing-bet-multi`);
    }
    if(this.betSlip.system.length && !conflict){
      const systemObject = [];
      picks.forEach(e => {
        systemObject.push({
          'event_id': e.eventId,
          'price': e.price,
          'eachway': false
        })
      });
      this.betSlip.system.forEach(e => {
        this.websocketService.sendMessage({
          'command': 'do_bet',
          'params': {
            "each_way": false,
            "type": 3,
            "mode": 2,
            "odd_type": 0,
            "amount": e.price,
            "bets": systemObject,
            "sys_bet": e.sys_bet
          },
          'rid': `placing-bet-system-${e.type}`
        });
        this.picksRid.push(`placing-bet-system-${e.type}`);
      })
    }
    if(this.betSlip.multiples.length && !conflict){
      const multiplesObject = [];
      picks.forEach(e => {
        multiplesObject.push({
          'event_id': e.eventId,
          'price': e.price
        })
      });
      this.betSlip.multiples.forEach(e => {
        if(Number(e.stake) > 0){
          this.websocketService.sendMessage({
            'command': 'do_bet',
            'params': {
              "type": e.type,
              "mode": 2,
              "odd_type": 0,
              "amount": e.stake,
              "bets": multiplesObject
            },
            'rid': `placing-bet-multiples-${e.type}`
          });
          this.picksRid.push(`placing-bet-multiples-${e.type}`);
        }
      })
    }
    this.pickedSubscription = this.websocketService.getData().subscribe(data => {
      if (data.data && data.data !== 'null' && data.data !== 'undefined') {
        if (this.picksRid.includes(data.rid)) {
          this.picksRid = this.picksRid.filter(item => item !== data.rid);
          this.betRef = data.data.details.bet_id;
        } if (!this.picksRid.length){
          this.pickedSubscription.unsubscribe();
          this.auth.GetUserInfo();
          this.subscriptionsService.sendBetRef(this.betRef)
          this.subscriptionsService.setIfBetComplete(true);
          this.changeSetSlipObject('placedWithNoErrors', true);
        }
      }
    });

  }

  get picksIdsArray(){
    return this.picksRid;
  }


  twoDimArrayUnion(arr1, arr2) {
    for (let i = 0; i < arr2.length; i++) {
      let duplicate = false;

      for (let j = 0; j < arr1.length; j++)
        if (arr1[j].length === arr2[i].length)
          for (let k = 0; k < arr1[j].length; k++)
            if (arr1[j][k] !== arr2[i][k])
              break;
            else if (k === arr1[j].length - 1)
              duplicate = true;

      if (!duplicate)
        arr1.push(arr2[i]);
    }
    return arr1;
  }

  getUniquePermutations(arr, permLength) {
    if (arr.length <= permLength)
      return [arr];

    let permutations = [];
    let newArr = [];

    newArr = arr.slice(0);
    for (let i = 0; i < arr.length; i++) {
      newArr = arr.slice(0);
      newArr.splice(i, 1);
      permutations = this.twoDimArrayUnion((this.getUniquePermutations(newArr, permLength)),permutations);
    }
    return permutations;
  }

  get returnBetslip(){
    return this.betSlip;
  }

}

