import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';

@Component({
  selector: 'workspace-total-goals',
  templateUrl: './total-goals.component.html',
  styleUrls: ['./total-goals.component.scss']
})
export class TotalGoalsComponent implements OnInit, OnChanges {

  @Input() inPlayObject: any;
  markets: any = [];
  regularTime: any = {};
  firstHalf: any = [];
  secondHalf: any = [];
  whichShow: number;
  constructor() { }

  ngOnInit(): void {
    this.whichShow = 1;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['inPlayObject'] && changes['inPlayObject'].currentValue) {
      this.inPlayObject = Object.assign({}, changes['inPlayObject'].currentValue);
      if(this.inPlayObject.hasOwnProperty('competition')){
        this.getMarkets(this.inPlayObject['competition']['game']['market']);
      }
    }
  }
  getMarkets(obj){
    this.markets = [...obj];
  }
}
