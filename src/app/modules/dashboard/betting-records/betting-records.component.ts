import { Component, OnInit } from '@angular/core';
import { JsonService } from '../../../shared/services/json/json.service';
import { TranslateService } from '@ngx-translate/core';
import { FormControl, FormGroup } from '@angular/forms';
import {MomentDateAdapter} from '@angular/material-moment-adapter';
import * as _moment from 'moment';
// @ts-ignore
import {default as _rollupMoment} from 'moment';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { WebsocketService } from '../../../shared/services/websocket/websocket.service';
import {BET_TYPES} from '../../../shared/bet-types'
import {BET_RESULTS} from '../../../shared/bet-results'
import * as Moment from 'cypress/types/cy-moment';
const moment = _rollupMoment || _moment;

export const MY_FORMATS = {
  parse: {
    dateInput: 'DD/MM/YYYY',
  },
  display: {
    dateInput: 'DD/MM/YYYY',
    monthYearLabel: 'MM YYYY',
    dateA11yLabel: 'DD/MM/YYYY',
    monthYearA11yLabel: 'MM YYYY',
  },
};
export const MY_FORMATS_ZH = {
  parse: {
    dateInput: 'DD/MM/YYYY',
  },
  display: {
    dateInput: 'YYYY/DD/MM',
    monthYearLabel: 'MM YYYY',
    dateA11yLabel: 'DD/MM/YYYY',
    monthYearA11yLabel: 'MM YYYY',
  },
};
export const localeCode = localStorage.getItem('pageLanguage');

@Component({
  selector: 'workspace-betting-records',
  templateUrl: './betting-records.component.html',
  styleUrls: ['./betting-records.component.scss'],
  providers: [
    {provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE]},
    {provide: MAT_DATE_FORMATS, useValue: localeCode === 'en' ? MY_FORMATS : MY_FORMATS_ZH},
  ]
})
export class BettingRecordsComponent implements OnInit {
  casinoOrNot: any;
  loading: boolean;
  betResults = BET_RESULTS;
  betTypes = BET_TYPES;
  defaultBetTypeOption: any = {};
  selectBetTypeOptions: any = [];
  defaultResult: any = {};
  selectResultOptions: any = [];
  searchParameters: any = {
    type: 0,
    result: -10,
    start: Math.round((new Date().getTime() - 86400000) / 1000),
    end: Math.round(new Date().getTime() / 1000)
  };
  range: FormGroup;
  ridTimestamp: any;
  dataArray: any = [];
  dataArrayTemp: any = [];
  constructor(private jsonService: JsonService,
              private translate: TranslateService,
              private websocket: WebsocketService) {
    const today = new Date();
    const day = today.getDate();
    const month = today.getMonth();
    const year = today.getFullYear();

    this.range= new FormGroup({
      start: new FormControl(new Date(year, month, day - 1)),
      end: new FormControl(new Date())
    });
  }



  ngOnInit(): void {
    this.casinoOrNot = 0;
    this.getBettingRecords(Math.round((new Date().getTime() - 86400000) / 1000), Math.round(new Date().getTime() / 1000));
    this.jsonService.getJson(`bet-type-options-${ this.translate.currentLang }`).subscribe(data => {
      this.defaultBetTypeOption = data["default"];
      this.selectBetTypeOptions = data["options"];
    });

    this.jsonService.getJson(`bet-result-${ this.translate.currentLang }`).subscribe(data => {
      this.defaultResult = data["default"];
      this.selectResultOptions = data["options"];
    });
    this.websocket.getData().subscribe(data => {
      if (data.data && data.data !== 'null' && data.data !== 'undefined') {
        if (data.rid === `OHB-DashboardHistory-${this.ridTimestamp}`) {
          if(data.data.result === '-2455'){
            console.log('waiting....');
            setTimeout(() => {
              this.getBettingRecords(Math.round((new Date().getTime() - 86400000) / 1000), Math.round(new Date().getTime() / 1000));
            }, 500)
          } else {
            this.dataArrayTemp = [...data.data.bets];
            this.filterBets(this.searchParameters.type, this.searchParameters.result, data.data.bets);
            this.loading = false;
          }
        }
        if (data.rid === `OHB-CasinoHistory-${this.ridTimestamp}`) {
          if(data.data.result === '-2455'){
            console.log('waiting....')
          } else {
            this.dataArrayTemp = [...data.data.history];
            this.filterBets(this.searchParameters.type, this.searchParameters.result, data.data.history);
            this.loading = false;
          }

        }
      }
    })
  }

  changeBetType(e){
    this.searchParameters.type = e.optionName;
  }

  changeResult(e){
    this.searchParameters.result = e.optionName;
  }

  setFilters(){
    if(this.searchParameters.start === this.range.value.start.unix() && this.searchParameters.end === this.range.value.end.unix()){
      this.filterBets(this.searchParameters.type, this.searchParameters.result, this.dataArrayTemp);
    } else {
      this.searchParameters.start = this.range.value.start.startOf("day").unix();
      this.searchParameters.end = this.range.value.end.endOf("day").unix();
      if(!this.casinoOrNot){
        this.getBettingRecords(this.searchParameters.start, this.searchParameters.end);
      } else {
        this.getCasinoRecords(this.searchParameters.start, this.searchParameters.end);
      }
    }

  }

  getBettingRecords(start, end){
    this.loading = true;
    this.ridTimestamp = new Date().getTime();
      end = end + 86399;
      this.websocket.sendMessage({
        'command': 'bet_history',
        'params': {
          'where': {
            'from_date': start,
            'to_date': end,
            'with_pool_bets': true
          }
        },
        'rid': `OHB-DashboardHistory-${this.ridTimestamp}`
      })
  }

  filterBets(betType, resultType, data){
    if(!this.casinoOrNot){
      if(betType === 0 && resultType === -10){
        this.dataArray = [...data];
      } else {
        if(betType !== 0 && resultType === -10){
          this.dataArray = [...data.filter(e => e.type === betType)];
        } else if(resultType !== -10 && betType === 0){
          this.dataArray = [...data.filter(e => e.outcome === resultType)];
        } else if(betType !== 0 && resultType !== -10){
          this.dataArray = [...data.filter(e => e.outcome === resultType && e.type === betType)];
        }
      }
    } else {
      if(resultType === -10){
        this.dataArray = [...data];
      } else {
          this.dataArray = [...data.filter(e => e.operation === resultType)];
      }
    }
  }

  getCasinoRecords(start, end){
    this.loading = true;
    this.ridTimestamp = new Date().getTime();
    this.websocket.sendMessage({
      "command": "balance_history",
      "params": {
        "where": {
          "from_date": start,
          "to_date": end
        },
        "product": "Casino"
      },
      "rid": `OHB-CasinoHistory-${this.ridTimestamp}`
    })
  }

  changeSection(e){
      this.casinoOrNot = e;
      if(!e){
        this.getBettingRecords(Math.round((new Date().getTime() - 86400000) / 1000), Math.round(new Date().getTime() / 1000));
        this.jsonService.getJson(`bet-result-${ this.translate.currentLang }`).subscribe(data => {
          this.defaultResult = data["default"];
          this.selectResultOptions = data["options"];
        });
      } else {
        this.getCasinoRecords(Math.round((new Date().getTime() - 86400000) / 1000), Math.round(new Date().getTime() / 1000));
        this.jsonService.getJson(`casino-result-${ this.translate.currentLang }`).subscribe(data => {
          this.defaultResult = data["default"];
          this.selectResultOptions = data["options"];
        });
      }

  }
}
