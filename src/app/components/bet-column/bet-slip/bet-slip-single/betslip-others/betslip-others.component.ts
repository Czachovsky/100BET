import { Component, Input, OnInit } from '@angular/core';
import { BetSlipService } from '../../../../../shared/services/bet-slip/bet-slip.service';
import { BET_TYPES } from '../../../../../shared/bet-types'
import { SubscriptionsService } from '../../../../../shared/services/subscriptions/subscriptions.service';
@Component({
  selector: 'workspace-betslip-others',
  templateUrl: './betslip-others.component.html',
  styleUrls: ['./betslip-others.component.scss']
})
export class BetslipOthersComponent implements OnInit {
  betTypes = BET_TYPES;
  otherStake: any;
  @Input() betType: any;
  multiplier: any;
  betTypeSettings: any = {multiplier: '', minAccSize: '', possibleWin: ''};
  showNumpad:  boolean;
  constructor(private betslip: BetSlipService, private subscription: SubscriptionsService) { }

  ngOnInit(): void {
    switch (this.betType) {
      case 5:
        this.betTypeSettings.multiplier = 4;
        this.betTypeSettings.minAccSize = 2;
        this.multiplier = 4;
        break;
      case 12:
        this.betTypeSettings.multiplier = 7;
        this.betTypeSettings.minAccSize = 1;
        this.multiplier = 7;
        break;
      case 6:
        this.betTypeSettings.multiplier = 11;
        this.betTypeSettings.minAccSize = 2;
        this.multiplier = 11;
        break;
      case 14:
        this.betTypeSettings.multiplier = 15;
        this.betTypeSettings.minAccSize = 1;
        this.multiplier = 15;
        break;
      case 8:
        this.betTypeSettings.multiplier = 26;
        this.betTypeSettings.minAccSize = 2;
        this.multiplier = 26;
        break;
      case 15:
        this.betTypeSettings.multiplier = 31;
        this.betTypeSettings.minAccSize = 1;
        this.multiplier = 31;
        break;
      case 9:
        this.betTypeSettings.multiplier = 57;
        this.betTypeSettings.minAccSize = 2;
        this.multiplier = 57;
        break;
      case 16:
        this.betTypeSettings.multiplier = 63;
        this.betTypeSettings.minAccSize = 2;
        this.multiplier = 63;
        break;
      case 10:
        this.betTypeSettings.multiplier = 120;
        this.betTypeSettings.minAccSize = 2;
        this.multiplier = 120;
        break;
      case 11:
        this.betTypeSettings.multiplier = 247;
        this.betTypeSettings.minAccSize = 2;
        this.multiplier = 247;
        break;
    }
  }

  test(e) {

    if (e > 0 && e !== '' && e !== 'NaN') {
      // if (!this.betslip.getBetSlipFromLocalStorage().type.includes(this.betType)) {
      //   const type = this.betslip.getBetSlipFromLocalStorage().type;
      //   type.push(this.betType);
      //   this.betslip.changeSetSlipObject('type', type);
      //
      // }
      const picks = this.betslip.getBetSlipFromLocalStorage().additionalPicks;
      picks.push({
        pickType: this.betTypes[this.betType],
        stakePerOne: Number(e),
        fullStake: e * this.betTypeSettings.multiplier,
      })
    } else {
      const type = this.betslip.getBetSlipFromLocalStorage().type.filter(item => item !== this.betType);
      this.betslip.changeSetSlipObject('type', type);
      this.betslip.calculateTotalStake();
    }
  }

  formatIt(e){
    this.otherStake = parseFloat(e).toFixed(2);
    const multiple = this.betslip.getBetSlipFromLocalStorage().multiples;
    if(multiple.find(el => el.type === this.betType)){
      multiple.map( f => {
        if(f.type === this.betType){
          f.stake = e;
        }
      })
    } else {
      multiple.push({
        stake : Number(e),
        price: e * this.betTypeSettings.multiplier,
        type: this.betType,
        possible_return: Number(this.getPossibleWin().toFixed(2))
      });
    }
    this.betslip.changeSetSlipObject('multiples', multiple);
    this.betTypeSettings.possibleWin = Number(this.getPossibleWin().toFixed(2));
    this.subscription.pleaseCheckErrors(true);
  }


  // calculation functions

  getAccumulatorPrice(priceArray) {
    let result = 1;

    for (let i = 0; i < priceArray.length; i++)
      result = result * priceArray[i];
    return result;
  }

  getCoverBetMaxReturns(priceArray, minAccSize, stake) {

    let total = 0;

    for (let i = minAccSize; i <= priceArray.length; i++) {
      const perms = this.betslip.getUniquePermutations(priceArray, i);

      for (let j = 0; j < perms.length; j++)
        total += this.getAccumulatorPrice(perms[j]) * stake;
    }

    return total;
  }

  getArrayOfPrices(){
    const arr = [];

    this.betslip.getBetSlipFromLocalStorage().picks.map(e => {
      arr.push(e.price);
    })

    return arr;
  }

  getPossibleWin(){
    return this.getCoverBetMaxReturns(this.getArrayOfPrices(), this.betTypeSettings.minAccSize ,this.otherStake)
  }
  mobileValueFromNumpad(e){
    this.otherStake = e.join('');
    this.betTypeSettings.possibleWin = Number(this.getPossibleWin().toFixed(2));
  }
  acceptMobileValueFromNumpad(e){
    this.showNumpad = false;
    this.test(this.otherStake);
    this.formatIt(this.otherStake);
  }
}
