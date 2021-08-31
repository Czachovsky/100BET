import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class OddsService {

  oddFormat: any;

  constructor() {
    this.setOddsFormat();
  }

  setOddsFormat(){
    if(localStorage.getItem('100BetOddFormat') && localStorage.getItem('100BetOddFormat') !== ''){
      this.oddFormat = localStorage.getItem('100BetOddFormat')
    } else {
      this.oddFormat = 'decimal';
    }
  }

  get oddFormatName(){
    return this.oddFormat
  }

}
