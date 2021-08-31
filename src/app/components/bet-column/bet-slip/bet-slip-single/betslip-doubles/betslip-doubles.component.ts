import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { BetSlipService } from '../../../../../shared/services/bet-slip/bet-slip.service';
import { Subscription } from 'rxjs';
import { SubscriptionsService } from '../../../../../shared/services/subscriptions/subscriptions.service';
import { OddsService } from '../../../../../shared/services/odds/odds.service';

@Component({
  selector: 'workspace-betslip-doubles',
  templateUrl: './betslip-doubles.component.html',
  styleUrls: ['./betslip-doubles.component.scss']
})
export class BetslipDoublesComponent implements OnInit, OnDestroy {
  @Input() betType: string;
  @Input() permutation: string;
  doublesArray: any;
  doublesArrayLength: any;
  betSlipPicks: any;
  doublesStake: any;
  showTable: boolean;
  betSlipChanges: Subscription;
  doublesVal: any;
  totalReturn: any = 0;
  showNumpad: boolean;
  constructor(private betslip: BetSlipService, private subscription: SubscriptionsService, public os: OddsService) {
     this.betSlipPicks = [...this.betslip.getBetSlipFromLocalStorage().picks];
      this.betSlipChanges = this.subscription.getBetSlipChanges().subscribe(data => {
        if(data){
         // console.log('zmieniony betslip');
        }
      })
  }

  ngOnInit(): void {
    this.doublesStake = 0;
    this.doublesArrayLength = this.combinationsCount(this.betSlipPicks.length, this.permutation);
    if(this.doublesArrayLength === 1) {
      this.doublesVal = Number(this.betslip.getBetSlipFromLocalStorage().multi_stake) > 0 ? parseFloat(this.betslip.getBetSlipFromLocalStorage().multi_stake).toFixed(2) : 0;
      this.doublesStake = Number(this.betslip.getBetSlipFromLocalStorage().multi_stake) > 0 ? parseFloat(this.betslip.getBetSlipFromLocalStorage().multi_stake).toFixed(2) : 0;
    }
    this.doublesFormat();
    // this.showTable = false;
    // this.doublesFormat();
    // if(this.betslip.getBetSlipFromLocalStorage().multi_stake !== '' && this.doublesArray.length === 1){
    //   this.doublesVal = this.betslip.getBetSlipFromLocalStorage().multi_stake;
    //   this.doublesStake = parseFloat(this.betslip.getBetSlipFromLocalStorage().multi_stake);
    //   this.doublesArray.map(e => {
    //     e.doublesToReturn  = this.doublesStake * e.doublesOdds;
    //   })
    // } else {
    //   this.betslip.getBetSlipFromLocalStorage().system.map(e => {
    //     if(e.type === `x${this.permutation}`){
    //       this.doublesVal = e.stake;
    //     }
    //   })
    //
    // }
  }

  showTableFn(){
    if(!this.showTable){
      this.showTable = true;
    } else {
      this.doublesArray =  [];
      this.showTable = false;
    }
  }

  formatValue() {
    this.doublesVal = parseFloat(this.doublesStake).toFixed(2);
    if (this.doublesArrayLength === 1) {
      this.betslip.changeSetSlipObject('multi_stake', this.doublesVal);
      if (parseFloat(this.doublesVal) > 0 && this.doublesVal !== '') {
        if (!this.betslip.getBetSlipFromLocalStorage().type.includes('multi')) {
          const _betslip = this.betslip.getBetSlipFromLocalStorage();
          _betslip.type.push('multi');
          this.betslip.changeSetSlipObject('type', _betslip.type);
        }
      } else {
        if (this.betslip.getBetSlipFromLocalStorage().type.includes('multi')) {
          const _betslip = this.betslip.getBetSlipFromLocalStorage();
          _betslip.type = _betslip.type.filter(item => item !== 'multi');
          this.betslip.changeSetSlipObject('type', _betslip.type);
        }
      }
    } else {
       const system = this.betslip.getBetSlipFromLocalStorage().system;
      if (system.find(el => el.type === `x${this.permutation}`)) {
        system.map(f => {
          if (f.type === `x${this.permutation}`) {
            f.stake = this.doublesVal;
            f.price = this.doublesArrayLength * this.doublesVal,
            f.possible_return = this.totalReturn
          }
        });
      } else {
        system.push({
          price: this.doublesVal * this.doublesArrayLength,
          stake: this.doublesVal,
          possible_return: this.totalReturn,
          type: `x${this.permutation}`,
          sys_bet: this.permutation});
      }
       this.betslip.changeSetSlipObject('system', system);
    }
    this.doublesArray.map(e => {
      e.doublesToReturn  = this.doublesStake * e.doublesOdds;
    });
    this.subscription.pleaseCheckErrors(true);
  }

  test(event){
    let total = 0;
    if(parseFloat(event).toFixed(2) !== 'NaN' && parseFloat(event).toFixed(2) !== ''){
      this.doublesStake = event;
    } else {
      this.doublesStake = 0;
      this.doublesVal = 0;
    }
    this.doublesArray.map(e => {
      e.doublesToReturn  = this.doublesStake * e.doublesOdds;
      total = total + e.doublesToReturn;
    })
    this.totalReturn = total;
    // if(this.doublesStake === ''){
    //   this.showTable = false;
    // }
  }

  doublesFormat(){
    const y = [];

    this.betSlipPicks.map((e,i) => {
      y.push({index: i + 1, price: e.price});
    });
    this.betSlipPicks.map((e,i) => {e.index = i + 1});
    this.doublesArray = [...this.betslip.getUniquePermutations(y,this.permutation)];
    this.doublesArray.map((e) => {
      let x = 1;
      e.map((f) => {
        x = x * f.price;
      })
      e.doublesOdds = x.toFixed(2);
    });
    if(this.doublesStake === ''){
      this.showTable = false;
    }
    this.doublesArray.map(e => {
      e.doublesToReturn  = this.doublesStake * e.doublesOdds;
    })
  }

  ngOnDestroy() {
   // this.betSlipChanges.unsubscribe();
  }

  showAndCalculateTable(){
    this.showTable = !this.showTable;
    // this.doublesArray = [];
    // if(this.showTable){
    //   this.showTable = false;
    // } else {
    //   this.doublesFormat();
    //   this.showTable =  true;
    // }
  }
  combinationsCount(m, n) {
    if (m < n) {
      return 0;
    } else if (m === n || n === 0) {
      return 1;
    } else {
      let c = 1, i;
      for (i = n + 1; i <= m; i ++) {
        c *= i;
      }
      for (i = 2; i <= m - n; i ++) {
        c /= i;
      }
      return c;
    }
  }

  mobileValueFromNumpad(e){
    this.doublesVal = e.join('');
  }
  acceptMobileValueFromNumpad(e){
    this.showNumpad = false;

    this.test(Number(this.doublesVal));
    this.formatValue();
  }

}
