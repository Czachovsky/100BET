import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'workspace-cashout-history',
  templateUrl: './cashout-history.component.html',
  styleUrls: ['./cashout-history.component.scss']
})
export class CashoutHistoryComponent implements OnInit {

  @Output() closeHistory:  EventEmitter<any> = new EventEmitter<any>();
  @Input() cashOutHistory: any;
  constructor() { }

  ngOnInit(): void {
    if(this.cashOutHistory.total_partial_cashout_amount === null){
      this.cashOutHistory.total_partial_cashout_amount = 0;
    }
    let original_stake = this.cashOutHistory.amount;
    this.cashOutHistory.cashouts_history.map(e => {
      original_stake = original_stake - e.stake;
      e.remaining_stake = Number(original_stake.toFixed(2));
      e.to_return = this.cashOutHistory.k * e.remaining_stake;
      e.to_return = Number(e.to_return.toFixed(2));
    })
  }

  triggerCloseHistory(){
    this.closeHistory.emit(true);
  }

}
