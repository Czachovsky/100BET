import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnInit,
  Output, QueryList,
  SimpleChanges,
  ViewChild, ViewChildren
} from '@angular/core';
import {SubscriptionsService} from "../../../../shared/services/subscriptions/subscriptions.service";
import {BetSlipService} from "../../../../shared/services/bet-slip/bet-slip.service";
import { Subscription } from "rxjs";
import { WindowService } from "../../../../shared/services/window/window.service";
import { EventEmitter } from '@angular/core';
import { FormControl } from '@angular/forms';
import { debounceTime } from 'rxjs/operators';
import { OddsService } from '../../../../shared/services/odds/odds.service';
@Component({
  selector: 'workspace-bet-slip-single',
  templateUrl: './bet-slip-single.component.html',
  styleUrls: ['./bet-slip-single.component.scss']
})
export class BetSlipSingleComponent implements OnInit, OnChanges {
  @ViewChildren('input') inputs: QueryList<ElementRef>;
  @ViewChild('xDD', {static: false}) xDD: ElementRef;
  @ViewChild('xD', {static: false}) xD: ElementRef;

  @Input() pickedItems: any;
  @Input() isBetPlaced: boolean;
  @Input() conflictError: boolean;
  @Input() openBetslip: boolean;
  pickedItemsLength: any = [];
  isMobile: boolean;
  isMobileCheck: Subscription;
  inputStake: FormControl = new FormControl('');
  showMultiples: boolean;
  betslipChangeSubscription: Subscription;
  betslip: any;
  lShadow:boolean;
  rShadow:boolean;
  showMultiNumpad: boolean;
  @Output() chageBetslip: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() errorEmiter: EventEmitter<object> = new EventEmitter<object>();
  multiValNumpad: any;

  constructor(private subscriptionService: SubscriptionsService,
              private betSlipService: BetSlipService,
              private windowService: WindowService,
              public os: OddsService) {
    this.isMobileCheck = this.windowService.onResize$.subscribe((data) => {
      if (data.width <= 997) {
        this.isMobile = true;
      } else {
        this.isMobile = false;
      }
    });

    this.betslipChangeSubscription = this.subscriptionService.getBetSlipChanges().subscribe(data => {
      this.pickedItemsLength.length = this.betSlipService.getBetSlipFromLocalStorage().picks.length;
      this.betslip = this.betSlipService.getBetSlipFromLocalStorage();
    })
    this.subscriptionService.getSelectBetslipInput().pipe(debounceTime(400)).subscribe(data => {
      if(data === 'single'){
        this.inputs.toArray()[0].nativeElement.click();
        this.inputs.toArray()[0].nativeElement.select();
      }
    })

    this.subscriptionService.getBetSlipChangesButDoNotSubscribeAgain().subscribe(data => {
      this.betslip = this.betSlipService.getBetSlipFromLocalStorage();
      if(this.openBetslip){
        setTimeout(() =>{
          if(this.betSlipService.getBetSlipFromLocalStorage().picks.length){
            this.freeBetsShadows();
          }
        }, 500)
      }
    })
  }

  ngOnInit(): void {
    this.windowService.getScreenSize() <= 997 ? this.isMobile = true : this.isMobile = false;
    this.betslip = this.betSlipService.getBetSlipFromLocalStorage();
    this.pickedItemsLength.length = this.pickedItems.length;
    //this.showMultiples = true;

  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['conflictError'] && changes['conflictError'].currentValue) {
      this.conflictError = changes['conflictError'].currentValue;
    }
    if (changes['openBetslip'] && changes['openBetslip'].currentValue) {
      if(changes['openBetslip'].currentValue){
        this.freeBetsShadows();
      }
    }
  }

  removeThisItem(pickId) {
    this.betSlipService.removePickFromBetSlip(pickId.eventId);
    this.subscriptionService.setBetSlipDeleted(true);
  }

  changeSelectState(e) {
    e.selected = !e.selected;
    this.betSlipService.changeSetSlipObject('picks', this.pickedItems);
  }

  showNumpad(e, i){
    if(this.isMobile){
      this.subscriptionService.setShowNumpad({
        show: true,
        index: i
      })
    }
  }
  valFromInput(e, i) {
      if(parseFloat(e).toFixed(2) !== 'NaN' && parseFloat(e).toFixed(2) !== ''){
        this.pickedItems[i].possibleWin = this.pickedItems[i].stake * this.pickedItems[i].price;
      } else {
        this.pickedItems[i].stake = 0;
      }
    this.betSlipService.changeSetSlipObject('picks', this.pickedItems);
    this.subscriptionService.setSinglePickChanged(true);
    this.chageBetslip.emit(true);
  }


  whatShouldIDisplay(val, picked){
        if(val.trim() === 'W1'){
          return picked.team1Name;
        } else if(val.trim() === 'W2') {
          return picked.team2Name;
        } else {
          return picked.selectedOption;
        }
    }

  trackByPickId(index: number){
      return index;
  }

  onSwipe(e, i) {
    e.preventDefault();
    const direction = Math.abs(e.deltaX) > 40 ? (e.deltaX > 0 ? 'right' : 'left') : '';
    if (direction === 'right') {
      this.pickedItems[i].swipeLeft = false;
    } else if (direction === 'left') {
      this.pickedItems[i].swipeLeft = true;
    }
  }

  calculateValue(e, i){
    if(e.code !== 'Tab'){
      this.valFromInput(e.target.value, i);
    }
  }

  formatIt(e,i){
    if(!this.isMobile){
      this.pickedItems[i].stake = parseFloat(e).toFixed(2);
    }
    this.betSlipService.changeSetSlipObject('picks', this.pickedItems);
  }

  multiplesInputCalculate(e, type){

    switch (type) {
      case 'singles':
        this.pickedItems.map((element, index) => {
           this.formatIt(e, index);
        })
     //   console.log(e, type, this.pickedItems);
        break;
      case 'Multi':

        break;
      case 'System':

        break;
      default:

        break;
    }
  }

  mobileValueFromNumpad(event, i){
    this.pickedItems[i].stake = event.join('');
    this.pickedItems[i].possibleWin = this.pickedItems[i].stake * this.pickedItems[i].price;
  }
  acceptMobileValueFromNumpad(event, i){
    this.pickedItems[i].showNumpad = false;
    this.valFromInput(this.pickedItems[i].stake, i);
    this.formatIt(this.pickedItems[i].stake, i);
  }

  selectOrClear(e){
    if(!Number(e.value)){
      e.value = '';
    } else {
      e.select()
    }
  }

  selectFreeBet(fBet, i, j) {
    this.pickedItems[i].freebet.map((el, index) => {
      if (index !== j) {
        el.selected = false;
      }
    });
    if (this.pickedItems[i].freebet[j]['selected']) {
      this.pickedItems[i].freebet[j]['selected'] = false;
      this.pickedItems[i].selectedFreeBet = false;
      this.pickedItems[i].selectedFreeBetId = false;
    } else {
      this.pickedItems[i].freebet[j]['selected'] = true;
      this.pickedItems[i].selectedFreeBet = true;
      this.pickedItems[i].selectedFreeBetId = fBet.id;
    }

    this.pickedItems[i].stake = parseFloat(fBet.amount).toFixed(2);
    this.valFromInput(fBet.amount, i);
  }

  selectFreeBetMulti(fBet, i){
    this.betslip = this.betSlipService.getBetSlipFromLocalStorage();
    this.betslip.freeBetMulti.map((el,index) => {
      if (index !== i) {
        el.selected = false;
      }
    })
    if (this.betslip.freeBetMulti[i]['selected']) {
      this.betslip.freeBetMulti[i]['selected'] = false;
      this.betslip.freeBetMultiSelected = false;
      this.betslip.selectedFreeBetMultiId = false;
    } else {
      this.betslip.freeBetMulti[i]['selected'] = true;
      this.betslip.freeBetMultiSelected = true;
      this.betslip.selectedFreeBetMultiId = fBet.id;
    }
    if(fBet.amount.toFixed(2) === 'NaN'){
      this.betslip.multi_stake = ''
    } else {
      this.betslip.multi_stake = fBet.amount.toFixed(2);
    }
    this.betslip.possible_return_multi = fBet.amount * this.betslip.total_odds;
    this.betSlipService.setNewObjectToLocalStorageAndCalculateAll(this.betslip);
    this.betSlipService.calculateTotalStake();
  }


  freeBetsShadows(){
    if(this.xDD && this.xD && this.xDD.nativeElement && this.xD.nativeElement){
      const  { width: childWidth, x: childX } = this.xDD.nativeElement.getBoundingClientRect();
      const  { width: parentdWidth, x: parentX } = this.xD.nativeElement.getBoundingClientRect();
      if(childWidth > parentdWidth){
        if(childX === parentX){
          this.rShadow = true;
          this.lShadow = false;
        } else if((childWidth - parentdWidth) !== (Math.floor(parentX) - Math.floor(childX))){
          this.rShadow = true;
          this.lShadow = true;
        }  else {
          this.rShadow = false;
          this.lShadow = true;
        }
      }
    }
  }
  showMultiNumpadFn(e){
    this.showMultiNumpad = true;
  }
  mobileMultiValueFromNumpad(e){
   this.multiValNumpad = e;
   this.subscriptionService.setMultiValNumpad(e);
  }
  acceptMobileMultiValueFromNumpad(e){
    this.showMultiNumpad = false;
    this.subscriptionService.setMultiValNumpadAccept(e);
  }
}


