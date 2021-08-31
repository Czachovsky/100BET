import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';

@Component({
  selector: 'workspace-match-results',
  templateUrl: './match-results.component.html',
  styleUrls: ['./match-results.component.scss']
})
export class MatchResultsComponent implements OnInit, OnChanges {

  @Input() inPlayObject: any;
  markets: any = [];
  regularTime: any = {};
  firstHalf: any;
  secondHalf: any;
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
    this.regularTime['P1XP2'] = obj.filter(e => e.type === 'P1XP2')[0];
    this.regularTime['1X12X2'] = obj.filter(e => e.type === '1X12X2')[0];
    this.firstHalf = obj.filter(e => e.type === 'HalfTimeResult');
    this.secondHalf = obj.filter(e => e.type === 'SecondHalfResult');
  }

}
