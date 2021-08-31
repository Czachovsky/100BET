import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';

@Component({
  selector: 'workspace-asian-handicap',
  templateUrl: './asian-handicap.component.html',
  styleUrls: ['./asian-handicap.component.scss']
})
export class AsianHandicapComponent implements OnInit, OnChanges {
  @Input() inPlayObject: any;
  markets: any = [];
  asianHandicap: any = {};
  constructor() { }

  ngOnInit(): void {
  }
  ngOnChanges(changes: SimpleChanges) {
    if (changes['inPlayObject'] && changes['inPlayObject'].currentValue) {
      this.inPlayObject = Object.assign({}, changes['inPlayObject'].currentValue);
      if(this.inPlayObject.hasOwnProperty('competition')){
        this.getMarkets(this.inPlayObject['competition']['game']['market'])
      }
    }
  }


  getMarkets(obj){
    this.asianHandicap['BothTeamsToScore'] = obj.filter(e => e.type === 'BothTeamsToScore');
    this.asianHandicap['AsianHandicap'] = obj.filter(e => e.type === 'AsianHandicap');
  }
}
