import {
  Component,
  ElementRef, EventEmitter,
  Input, OnChanges,
  OnDestroy,
  OnInit,
  Output,
  QueryList, SimpleChanges,
  ViewChild,
  ViewChildren
} from '@angular/core';
import { BetSlipService } from '../../../../../shared/services/bet-slip/bet-slip.service';
import { Subscription } from 'rxjs';
import { SubscriptionsService } from '../../../../../shared/services/subscriptions/subscriptions.service';
import { OddsService } from '../../../../../shared/services/odds/odds.service';
import { debounceTime } from 'rxjs/operators';

@Component({
  selector: 'workspace-bet-slip-multiple',
  templateUrl: './bet-slip-multiple.component.html',
  styleUrls: ['./bet-slip-multiple.component.scss']
})
export class BetSlipMultipleComponent implements OnInit, OnDestroy {
  @ViewChildren('multipleStake') multipleStake: QueryList<ElementRef>;
  betSlip: any;
  betSlipChanges: Subscription;
  betSlipChangess: Subscription;
  showNumpad = false;
  displayVal: any;
  possibleReturn: any;
  @Output() showMultiNumpad: EventEmitter<any> = new EventEmitter<any>();
  @Input() isBetPlaced: boolean;
  constructor(private betslipService: BetSlipService, private subscription: SubscriptionsService,public os: OddsService) {
    this.betSlip = Object.assign({},this.betslipService.getBetSlipFromLocalStorage());
    this.betSlipChanges = this.subscription.getBetSlipChanges().subscribe(data => {
      if (data) {
         this.betSlip = Object.assign({}, this.betslipService.getBetSlipFromLocalStorage());
        if(this.betSlip.multi_stake === 'NaN' || this.betSlip.multi_stake === ''){
           this.displayVal = '';
         } else {
           this.displayVal = parseFloat(this.betSlip.multi_stake).toFixed(2);
         }
      }
    });
    this.betSlipChangess = this.subscription.getBetSlipChangesButDoNotSubscribeAgain().subscribe(data => {
      if (data) {
        this.betSlip = Object.assign({}, this.betslipService.getBetSlipFromLocalStorage());
        if(this.betSlip.multi_stake === 'NaN' || this.betSlip.multi_stake === ''){
          this.displayVal = '';
        } else {
          this.displayVal = parseFloat(this.betSlip.multi_stake).toFixed(2);
        }
      }
    });
    this.subscription.getSelectBetslipInput().pipe(debounceTime(400)).subscribe(data => {
      if(data === 'multi'){
        this.multipleStake.toArray()[0].nativeElement.select();
      }
    })

    this.subscription.getMultiValNumpad().subscribe(data => {

      this.possibleReturn = parseFloat(this.betSlip['total_odds']) * Number(data.join(''));
      this.displayVal = Number(data.join(''));
      this.changeMultiStake(this.displayVal)
    })
    this.subscription.getMultiValNumpadAccept().subscribe(data => {
      if(data) {
        this.formatMultiStake();
      }
    })
  }


  ngOnDestroy() {
    this.betSlipChanges.unsubscribe();
    this.betSlipChangess.unsubscribe();
  }
  ngOnInit(): void {
    this.betSlip = Object.assign({}, this.betslipService.getBetSlipFromLocalStorage());
    if(this.betSlip.multi_stake === 'NaN' || this.betSlip.multi_stake === ''){
      this.displayVal = '';
    } else {
      this.displayVal = parseFloat(this.betSlip.multi_stake).toFixed(2);
    }
    this.possibleReturn = parseFloat(this.betSlip['total_odds']) * parseFloat(this.betSlip['multi_stake']);
  }

  changeMultiStake(event, format?) {
    const _b = this.betslipService.getBetSlipFromLocalStorage();
    _b.freeBetMultiSelected = false;
    _b.selectedFreeBetMultiId = false;
    if(_b.freeBetMulti){
      _b.freeBetMulti.map(e => {
        e.selected = false;
      })
    }
    if(parseFloat(event).toFixed(2) !== 'NaN' && parseFloat(event).toFixed(2) !== ''){
      if (!_b.type.includes('multi')) {
        _b.type.push('multi');
      }
      _b.multi_stake = parseFloat(event);
      _b.possible_return_multi = parseFloat(this.betSlip['total_odds']) * parseFloat(event);
      this.possibleReturn = parseFloat(this.betSlip['total_odds']) * parseFloat(event);
    } else {
      _b.type = _b.type.filter(item => item !== 'multi');
      _b.multi_stake = '';
      _b.type = _b.type.filter(item => item !== 'multi')
      _b.possible_return_multi = 0;
      this.possibleReturn = 0;
    }
    this.betslipService.setNewObjectToLocalStorage(_b);
    if(format){
      setTimeout(() => {
        this.formatMultiStake();
      },1500);
    }
  }

  formatMultiStake(format?) {
    if(format){
      this.displayVal = parseFloat(this.betslipService.getBetSlipFromLocalStorage().multi_stake).toFixed(2);
    }
   this.betslipService.changeSetSlipObject('multi_stake', this.displayVal)
  }

  mobileValueFromNumpad(e){}
  acceptMobileValueFromNumpad(e){}
  showNumpadFn(){
    this.showMultiNumpad.emit(true);
  }
}
