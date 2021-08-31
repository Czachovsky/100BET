import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { Subscription } from "rxjs";
import { SubscriptionsService } from "../../../shared/services/subscriptions/subscriptions.service";
import { BetSlip } from "../../../shared/interfaces/pick";
import { BetSlipService } from "../../../shared/services/bet-slip/bet-slip.service";

@Component({
  selector: 'workspace-stake-numpad',
  templateUrl: './stake-numpad.component.html',
  styleUrls: ['./stake-numpad.component.scss'],
})
export class StakeNumpadComponent implements OnInit {
  @Input() startValue: number;
  @Output() newValue = new EventEmitter<number>();
  @Output() confirmValue = new EventEmitter<boolean>();
  @Input() indexOrAll: any;
  arr: any = [];
  value: number;
  tempBetSlip: any;
  constructor(private betSlipService: BetSlipService,  private subscriptionService: SubscriptionsService) {}

  ngOnInit(): void {
    this.arr = this.startValue.toString(10).split('');
    this.value = Number(parseFloat(this.arr.join('')).toFixed(2));
  }

  buttonClick(val) {
    if (val === 'remove') {
      this.arr.pop();
      if (!this.arr.length) {
        this.arr = ['0'];
      }
    } else if (val === 'enter') {
      this.submitValues();
      this.confirmValue.emit(true);
    } else if (val === '00') {
      this.arr.push('00');
    } else {
      this.arr.push(val);
    }
    this.value = Number(parseFloat(this.arr.join('')).toFixed(2));
    this.newValue.emit(this.value);
  }

  addVal(value: number) {
    this.value = this.value + value;
    this.arr = this.value.toString(10).split('');
    this.newValue.emit(this.value);
  }

  submitValues(){

      this.tempBetSlip = Object.assign({}, this.betSlipService.getBetSlipFromLocalStorage());
      if(typeof this.indexOrAll === 'string' && this.indexOrAll === 'all'){
        this.tempBetSlip.picks.map(e => {
          e.stake = this.value;
        })
      } else {
        this.tempBetSlip.picks[this.indexOrAll].stake = this.value;
      }
      this.betSlipService.setNewObjectToLocalStorage(this.tempBetSlip);
      this.subscriptionService.triggerBetSlipChanges(true);
  }
}
