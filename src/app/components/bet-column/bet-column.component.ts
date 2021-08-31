import { Component, OnInit, Renderer2 } from '@angular/core';
import { Subscription } from 'rxjs';
import { SubscriptionsService } from '../../shared/services/subscriptions/subscriptions.service';
import { BetSlipService } from '../../shared/services/bet-slip/bet-slip.service';
import { WindowService } from '../../shared/services/window/window.service';
import { WebsocketService } from "../../shared/services/websocket/websocket.service";
import { AuthService } from '../../shared/services/auth/auth.service';

@Component({
  selector: 'workspace-bet-column',
  templateUrl: './bet-column.component.html',
  styleUrls: ['./bet-column.component.scss'],
})
export class BetColumnComponent implements OnInit {
  addPickToCart: Subscription;
  removePickFromCart: Subscription;
  pickedItems: any;
  betslipTabVisibility: boolean;
  myBetsTabVisibility: boolean;
  betSlipCartChanged: Subscription;
  betSlipCartChangedSmall: Subscription;
  betSlipV2: object = {};
  isMobile: boolean;
  isMobileCheck: Subscription;
  showMobileBetSlip: boolean;
  betSlipStateChecker: Subscription;
  animateBetSlip: boolean;

  eventIdArr: any = [];
  gameIdArr: any = [];
  betslipSubid: any;
  picksFormBC: any = {};
  tempPicksFormBC: any = {};
  isLogged: Subscription;
  logged: boolean;
  freeBetsTimestamp: any;
  constructor(
    public subscriptionsService: SubscriptionsService,
    private betSlipService: BetSlipService,
    private windowService: WindowService,
    private renderer: Renderer2,
    private websocketService: WebsocketService,
    private auth: AuthService
  ) {
    this.isLogged = this.subscriptionsService.getIsLoggedIn().subscribe((data)=>{
      this.logged = data;
      if(this.betSlipService.getBetSlipFromLocalStorage().picks.length && this.logged){
        if(this.auth.userData['has_free_bets']){
          if(this.betSlipService.getBetSlipFromLocalStorage().picks.length === 1){
            this.checkForFreeBets(this.betSlipService.getBetSlipFromLocalStorage().picks,1)
          } else {
            this.checkForFreeBets(this.betSlipService.getBetSlipFromLocalStorage().picks, 2)
          }

        }
      }
    })
    this.betSlipV2 = this.betSlipService.initNewBetSlip();
    this.pickedItems = this.betSlipV2;
    this.betSlipStateChecker = this.subscriptionsService.getShowMobileBetSlip().subscribe((data) => {
        if (data && this.isMobile) {
          this.showMobileBetSlip = data;
          setTimeout(() => {}, 50);
          const delay = (t) => new Promise((resolve) => setTimeout(resolve, t));
          delay(50).then(() => {
            this.animateBetSlip = true;
            setTimeout(() => {
              this.renderer.addClass(document.body, 'noscroll');
            }, 300);
          });
        }
      });
    this.isMobileCheck = this.windowService.onResize$.subscribe((data) => {
      if (data.width <= 997) {
        this.isMobile = true;
      } else {
        this.isMobile = false;
      }
    });
    this.betSlipCartChanged = this.subscriptionsService.getBetSlipChanges().subscribe((data) => {
        if (data) {
          this.pickedItems = this.betSlipService.initNewBetSlip();
          this.newBetslipSubscription();
          if(this.pickedItems.picks.length && this.auth.isLoggedIn){
            if(this.auth.userData['has_free_bets']){
              if(this.pickedItems.picks.length === 1){
                this.checkForFreeBets(this.pickedItems.picks, 1)
              } else {
                this.checkForFreeBets(this.pickedItems.picks, 2)
              }
            }
          }
        }
      });
    this.betSlipCartChangedSmall = this.subscriptionsService.getBetSlipChangesButDoNotSubscribeAgain().subscribe(data => {
      if(data){
        this.pickedItems = this.betSlipService.initNewBetSlip();
      }
    })
    this.addPickToCart = this.subscriptionsService.getAddPickToCart().subscribe((data) => {
        const cart = JSON.parse(localStorage.getItem('100BetCart'));
        cart.push(data.pick);
        this.pickedItems = cart;
        localStorage.setItem('100BetCart', JSON.stringify(cart));
      });
    this.removePickFromCart = this.subscriptionsService.getRemovedFromCart().subscribe((data) => {
        const cart = JSON.parse(localStorage.getItem('100BetCart'));
        this.pickedItems = cart.filter((e) => {
          return e.id !== data;
        });
        localStorage.setItem('100BetCart', JSON.stringify(this.pickedItems));
      });

    this.subscriptionsService.getBetSlipMobile().subscribe(data => {
      if (data === 'betslipTab') {
        this.betslipTabVisibility = true;
        this.myBetsTabVisibility = false;
      } else {
        this.betslipTabVisibility = false;
        this.myBetsTabVisibility = true;
      }
    })

  }

  ngOnInit(): void {
    this.betSlipService.changeSetSlipObject('multiples', []);
    this.betSlipService.changeSetSlipObject('system', []);
    if(this.betSlipService.getBetSlipFromLocalStorage()['multi_stake'] ==='' || this.betSlipService.getBetSlipFromLocalStorage()['multi_stake'] === 'NaN'){
      this.betSlipService.changeSetSlipObject('type', ['single']);
    }
    if (this.windowService.getScreenSize() <= 992) {
      this.isMobile = true;
    }

    this.websocketService.getData().subscribe(data => {
      if (data.rid === 'OHB-betslip') {
        this.betslipSubid = data.data.subid;
        this.picksFormBC = Object.assign({}, data.data.data.game);
        this.tempPicksFormBC = Object.assign({}, data.data.data.game);
      }
      if (data && data.data && data.data[this.betslipSubid]) {
          this.betSlipService.updateBetslipBC(this.tempPicksFormBC, data.data[this.betslipSubid].game)
      }
      if(data.rid.includes('get_freebets_for_betslip')){
        const eventId = data.rid.split('__')[1];
        if(eventId !== 'multi'){
          const picks = this.betSlipService.getBetSlipFromLocalStorage().picks;
          picks.map(e => {
            e.freebet = [];
            e.selectedFreeBet = false;
            if(Number(e.eventId) === Number(eventId) && data.data.details.length){
              data.data.details.forEach(f => {
                e.freebet.push(f)
              })

            }
          })
          this.betSlipService.changeSetSlipObject('picks', picks);
        } else {
          const mutliFreeBetslip = [...data.data.details];
          this.betSlipService.changeSetSlipObject('freeBetMulti', mutliFreeBetslip);
          this.betSlipService.changeSetSlipObject('freeBetMultiSelected', false);
        }




      }
    })


  if(this.betSlipService.getBetSlipFromLocalStorage().picks.length){
    this.newBetslipSubscription();
    this.betslipTabVisibility = true;
    this.myBetsTabVisibility = false;
  } else {
    this.betslipTabVisibility = false;
    this.myBetsTabVisibility = true;
  }


  }

  changeBetTab(tab, e) {
    e.preventDefault();
    if (tab === 'betslipTab') {
      this.betslipTabVisibility = true;
      this.myBetsTabVisibility = false;
    } else {
      this.betslipTabVisibility = false;
      this.myBetsTabVisibility = true;
    }
  }

  closeBetSlip() {
    this.animateBetSlip = false;
    this.renderer.removeClass(document.body, 'noscroll');
    setTimeout(() => {
      this.showMobileBetSlip = false;
    }, 500);
  }

  newBetslipSubscription() {
    this.gameIdArr = [];
    this.eventIdArr = [];
    this.betSlipService.getBetSlipFromLocalStorage().picks.forEach(e => {
      this.gameIdArr.push(e.gameId);
      this.eventIdArr.push(e.eventId);
    });
    if (this.betslipSubid && this.betslipSubid !== '') {
      this.websocketService.sendMessage({
        "command": "unsubscribe",
        "params": {
          "subid": this.betslipSubid
        }
      });
    }
    if(this.betSlipService.getBetSlipFromLocalStorage().picks.length){
      this.websocketService.sendMessage({
        command: 'get',
        params: {
          source: 'betting',
          what: {
            game: ['id', 'type', 'is_blocked', 'is_started', 'info', 'start_ts'],
            market: ['id', 'base', 'type'],
            event: ['id', 'price', 'type', 'name', 'base', 'base1', 'base2', 'ew_allowed'],
          },
          where: {
            event: {
              id: {
                '@in': this.eventIdArr,
              },
            },
            game: {
              id: {
                '@in': this.gameIdArr,
              },
            },
          },
          subscribe: true,
          // subscribe: false
        },
        rid: 'OHB-betslip',
      });
    }
  }

  checkForFreeBets(bets, type) {
    if(type === 1){
      bets.map(e => {
        this.sendFreeBetsliMessage(e, bets, 1);
      });
    } else {
      this.sendFreeBetsliMessage(false, bets, 2);
    }

  }

  sendFreeBetsliMessage(bet, bets, type){
    this.freeBetsTimestamp = new Date().getTime();
    let betToSend = [];
    if(bet){
      betToSend =  [{ event_id: bet.eventId, price: bet.price }]
    } else {
      bets.map(el => {
        betToSend.push({ event_id: el.eventId, price: el.price })
      })
    }

    this.websocketService.sendMessage({
      command: 'get_freebets_for_betslip',
      params: {
        mode: 2,
        type: type,
        each_way: false,
        is_live: bets.filter(e => e.isLive).length ? 1 : 0,
        bets: betToSend
      },
      rid: type === 1 ? `get_freebets_for_betslip__${bet.eventId}` : `get_freebets_for_betslip__multi`
    });
  }

}
