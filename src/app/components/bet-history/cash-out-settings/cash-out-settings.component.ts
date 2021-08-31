import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { isNumber } from 'util';
import { WebsocketService } from '../../../shared/services/websocket/websocket.service';
import { SubscriptionsService } from '../../../shared/services/subscriptions/subscriptions.service';

@Component({
  selector: 'workspace-cash-out-settings',
  templateUrl: './cash-out-settings.component.html',
  styleUrls: ['./cash-out-settings.component.scss']
})
export class CashOutSettingsComponent implements OnInit {
  @Input() cashoutBet: any;
  @Input() maximumCashOut: any;
  @Output()  partialCashOutValueEmitter = new EventEmitter<boolean>();
  @Output()  closeSettings = new EventEmitter<boolean>();
  partialValue = 0;
  autoValue = 0;
  //maximumCashOut = 0.75;
  partialCashOutValue;
  doneEnabled = false;
  openedSection = 1;
  autoCashOutAmount = {
    min: null,
    max: null
  };
  autoCashOutAmountError: boolean;
  autoCashOutAmountMaxError: boolean;
  autoCashOutAmountMinError: boolean;
  cashoutRule = {
    created: false,
    canceled: false,
    error: false,
    manualError: false,
    valueReachesAmount: '',
    partialAmount: null,
    loading: false,
    valueReaches: null,
    partialAmountError: false,
    partialAmountErrorMax: false,
    partialAmountErrorMin: false,
    fullCashout: false
  }
  websocketTimestamp: any;
  constructor(private websocket: WebsocketService, private subscriptionsService: SubscriptionsService) { }

  ngOnInit(): void {
    this.websocketTimestamp = '';
    this.autoCashOutAmount.min = this.cashoutBet.cash_out;
    this.autoCashOutAmount.max = this.cashoutBet.possible_win;
    if (this.cashoutBet.calculatedCashout) {
      this.partialValue = this.cashoutBet.calculatedCashout / this.maximumCashOut * 100;
      this.calculateCashOutSlider(this.partialValue);
    }
    if(this.cashoutBet.auto_cash_out_amount !== null){
      this.getAutoCashOutDetails(this.cashoutBet.id);
    }

    this.websocket.getData().subscribe(data => {
      if (data.data && data.data !== 'null' && data.data !== 'undefined') {
        if (data.rid === `getAutoCashOutDetails${this.websocketTimestamp}`) {
          if (data.data.result === 0) {
            this.cashoutRule.partialAmount = data.data.details.PartialAmount;
            this.cashoutRule.valueReachesAmount = data.data.details.MinAmount;
            this.cashoutRule.loading = false;
          }
        }
        if (data.rid === `removeAutoCashOutRule${this.websocketTimestamp}`) {
          if (data.data.result === 0) {
            this.cashoutRule = {
              created: false,
              canceled: false,
              error: false,
              manualError: false,
              valueReachesAmount: '',
              partialAmount: null,
              loading: false,
              valueReaches: null,
              partialAmountError: false,
              partialAmountErrorMax: false,
              partialAmountErrorMin: false,
              fullCashout: false
            }
            this.cashoutBet.auto_cash_out_amount = null;
          } else {
            console.log(data.data.result);
          }
        }
        if(data.rid === `createAutoCashOutRule${this.websocketTimestamp}`){
          if (data.data.result === 0) {
            this.getAutoCashOutDetails(this.cashoutBet.id);
            this.cashoutBet.auto_cash_out_amount = this.cashoutRule.valueReaches;
            //this.subscriptionsService.setIfNewBetHistory(true);
          } else {
            this.cashoutRule.loading = false;
          }

        }
      }
    })
  }

  calculateCashOutSlider(fromSlider) {
    let price = 0.01 * this.maximumCashOut * fromSlider;
    this.doneEnabled = true;
    if (+price.toFixed(2) === 0) {
      this.doneEnabled = false;
    }
    if (this.maximumCashOut >= 100){
      price = Math.round(price);
    } else if (this.maximumCashOut >= 10) {
      price = Math.round(price * 10) / 10;
    } else {
      price = Math.round(price * 100) / 100;
    }
    this.partialCashOutValue = price;
    this.partialCashOutValueEmitter.emit(this.partialCashOutValue);
  }
  calculateAutoCashOut(fromInput){
    if(!isNumber(fromInput) || (fromInput > this.autoCashOutAmount.max || fromInput < this.autoCashOutAmount.min)){
      this.cashoutRule.created = false;
      this.autoCashOutAmountError = true;
      if(fromInput > this.autoCashOutAmount.max){
        this.autoCashOutAmountMaxError = true;
        this.autoCashOutAmountMinError = false;
      }
      if(fromInput < this.autoCashOutAmount.min){
        this.autoCashOutAmountMinError = true;
        this.autoCashOutAmountMaxError = false;
      }
    } else {
      this.cashoutRule.created = true;
      this.autoCashOutAmountError = false;
      this.autoCashOutAmountMaxError = false;
      this.autoCashOutAmountMinError = false;
      this.cashoutRule.valueReaches = fromInput;
      this.cashoutRule.partialAmountError = false;
      this.cashoutRule.partialAmount = null;
      this.cashoutRule.fullCashout = true;
      if(this.cashoutRule.partialAmount > this.cashoutRule.valueReaches){
        this.cashoutRule.partialAmountError = true;
      }
    }
  }
  cashOut(){
    if(!this.doneEnabled){
      console.log('error');
    } else {
      console.log('saving cashing out settings', this.partialCashOutValue);
      this.partialCashOutValueEmitter.emit(this.partialCashOutValue);
      this.closeSettings.emit(true);
    }
  }
  createRule(create){
    if(create){
      this.createAutoCashOutRule(this.cashoutBet.id, !this.cashoutRule.fullCashout, this.cashoutRule.valueReaches, this.cashoutRule.partialAmount)
    } else {
      this.removeAutoCashOutRule(this.cashoutBet.id);
    }

  }

  createAutoCashOutRule(id, partial, amount, partialAmount?) {
    this.cashoutRule.loading = true;
    this.websocketTimestamp = new Date().getTime();
    let message;
    if (partial) {
      message = {
        'command': 'set_bet_auto_cashout',
        'params': {
          'bet_id': id,
          'min_amount': amount,
          'partial_amount': partialAmount
        },
        'rid': `createAutoCashOutRule${this.websocketTimestamp}`
      };
    } else {
      message = {
        'command': 'set_bet_auto_cashout',
        'params': {
          'bet_id': id,
          'min_amount': amount
        },
        'rid': `createAutoCashOutRule${this.websocketTimestamp}`
      };
    }
    this.websocket.sendMessage(message);
  }

  getAutoCashOutDetails(betId){
    this.cashoutRule.loading = true;
    this.websocketTimestamp = new Date().getTime();
      this.websocket.sendMessage({
        "command": "get_bet_auto_cashout",
        "params": {
          "bet_id": betId
        },
        "rid": `getAutoCashOutDetails${this.websocketTimestamp}`
      })
  }

  removeAutoCashOutRule(betId) {
    this.cashoutRule.loading = true;
    this.websocketTimestamp = new Date().getTime();
    this.websocket.sendMessage({
      'command': 'cancel_bet_auto_cashout',
      'params': {
        'bet_id': betId
      },
      'rid': `removeAutoCashOutRule${this.websocketTimestamp}`
    });
  }

  calculatePartialAmount(fromInput){
    if(!isNumber(fromInput)|| (fromInput > this.cashoutRule.valueReaches || fromInput === 0)){
      this.cashoutRule.partialAmountError = true;
      if(fromInput > this.cashoutRule.valueReaches){
        this.cashoutRule.partialAmountErrorMax = true;
      }
    } else {
      this.cashoutRule.partialAmountError = false;
      this.cashoutRule.partialAmount = fromInput;
    }
  }

  cashoutTypeChange(event, type) {
    if (type === 'full' && event.target.value) {
      this.cashoutRule.fullCashout = true;
      this.cashoutRule.partialAmountError = false;
    } else if (type === 'partial' && event.target.value) {
      this.cashoutRule.fullCashout = false;
      if(this.cashoutRule.partialAmount !== null && (this.cashoutRule.partialAmount > this.cashoutRule.valueReaches)){
        this.cashoutRule.partialAmountError = true;
      }
    }
  }

}
