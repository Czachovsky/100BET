import { Component, OnInit } from '@angular/core';
import { BetSlipService } from '../../../../../shared/services/bet-slip/bet-slip.service';
import { SubscriptionsService } from '../../../../../shared/services/subscriptions/subscriptions.service';
import { OddsService } from '../../../../../shared/services/odds/odds.service';

@Component({
  selector: 'workspace-betslip-singles',
  templateUrl: './betslip-singles.component.html',
  styleUrls: ['./betslip-singles.component.scss']
})
export class BetslipSinglesComponent implements OnInit {
  showNumpad: boolean;
  singlesArray: any;
  betSlipPicks: any;
  singlesStake: any;
  showTable: boolean;
  inputVal: any;
  constructor(private betslip: BetSlipService, private subscription: SubscriptionsService, public os: OddsService) {
    this.betSlipPicks = this.betslip.getBetSlipFromLocalStorage().picks;
    this.subscription.getBetSlipChangesButDoNotSubscribeAgain().subscribe(data => {
      if(data){
        this.betSlipPicks = this.betslip.getBetSlipFromLocalStorage().picks;
      }
    })
  }

  ngOnInit(): void {
    this.betSlipPicks.map((e,i) => {e.index = i + 1});
  }

  calculateValue(e){
    if(e.code !== 'Tab'){
      this.betSlipPicks.map(el => {
        el.stakeError = false;
        el.stake =  parseFloat(e).toFixed(2);
        el.possibleWin = el.stake * el.price;
      });
      this.betslip.changeSetSlipObject('picks', this.betSlipPicks);
      this.subscription.setSinglePickChanged(true);
    }
  }
  formatIt(e){
    this.singlesStake = parseFloat(e).toFixed(2);
    this.subscription.pleaseCheckErrors(true);
  }
  mobileValueFromNumpad(e){
    this.singlesStake = e.join('');
  }
  acceptMobileValueFromNumpad(e){
      this.showNumpad = false;
      this.calculateValue(Number(this.singlesStake));
      this.formatIt(Number(this.singlesStake));
  }
}
