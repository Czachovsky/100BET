import { Component, OnDestroy, OnInit } from '@angular/core';
import {TRANSACTION_STATUS} from './transaction-status'
// @ts-ignore
import { default as _rollupMoment } from 'moment';
import * as _moment from 'moment';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { FormControl, FormGroup } from '@angular/forms';
import { WebsocketService } from '../../../shared/services/websocket/websocket.service';
const moment = _rollupMoment || _moment;
import { HISTORY_BALANCE_TYPES } from '../../../shared/history-balance-types'
import { JsonService } from '../../../shared/services/json/json.service';
import { TranslateService } from '@ngx-translate/core';
import { WindowService } from '../../../shared/services/window/window.service';
import { Subscription } from 'rxjs';
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
  selector: 'workspace-transaction-records',
  templateUrl: './transaction-records.component.html',
  styleUrls: ['./transaction-records.component.scss'],
  providers: [
    {provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE]},
    {provide: MAT_DATE_FORMATS, useValue: localeCode === 'en' ? MY_FORMATS : MY_FORMATS_ZH},
  ]
})
export class TransactionRecordsComponent implements OnInit, OnDestroy {
  defaultTypeOption: any = {};
  selectTypeOption: any = [];
  pickedSelected: boolean;
  dateFromBtns: boolean;
  selectedType: any;
  selectedDate: any;
  balanceTypes = HISTORY_BALANCE_TYPES;
  ridTimestamp:any;
  ridWTimestamp:any;
  range: FormGroup;
  fromDate: any;
  toDate: any;
  maxDate: any;
  loading: boolean;
  dataArray: any = [];
  dataArrayTemp: any = [];
  withdrawalArr: any = [];
  withdrawCancelTimestamp: any;
  language: any;
  searchParameters: any = {
    type: [8,12,14,15,3,4,10,303,9],
    start: Math.round((new Date().getTime() - 86400000) / 1000),
    end: Math.round(new Date().getTime() / 1000)
  };
  isMobileCheck: Subscription;
  constructor(private websocket: WebsocketService, private jsonService: JsonService, private translate: TranslateService, private windowService: WindowService) {
    this.isMobileCheck = this.windowService.onResize$.subscribe(data =>  {
      if (data.width <= 997) {
        this.getSelectOptions();
      }
    })
    this.maxDate = new Date();
    const today = new Date();
    const day = today.getDate();
    const month = today.getMonth();
    const year = today.getFullYear();
    this.range= new FormGroup({
      start: new FormControl(new Date(year, month, day - 1)),
      end: new FormControl(new Date())
    });
  }

  ngOnDestroy() {
    this.isMobileCheck.unsubscribe();
  }

  ngOnInit(): void {
    this.language = localStorage.getItem('pageLanguage');

    if(this.windowService.getScreenSize() <= 997){
       this.getSelectOptions();
     }
    this.pickedSelected = true;
    this.selectedType = 0;
    const dt = new Date();
    dt.setDate( dt.getDate() - 1);
    this.getTransactionRecords(Math.round(dt.getTime() / 1000), Math.round(new Date().getTime() / 1000));
    this.getWithdrawal(Math.round(dt.getTime() / 1000), Math.round(new Date().getTime() / 1000))


    this.websocket.getData().subscribe(data => {
      if (data.data && data.data !== 'null' && data.data !== 'undefined') {
        if (data.rid === `OHB-DashboardHistoryTransactions-${this.ridTimestamp}`) {
          if(data.data.result === '-2455'){
            console.log('waiting....')
          } else {
            if (data.code === 0) {
              this.dataArray = [];
              this.dataArrayTemp = [...data.data.history];
              this.filterTransactions(this.searchParameters.type, data.data.history);
              this.loading = false;
              this.dateFromBtns = false;
            } else {
              console.log('error')
            }
            console.log('dataArray', this.dataArray)
          }
        }
        if(data.rid === `WithdrawCancel-${this.withdrawCancelTimestamp}`){
            if(data.data.result === 0){
              this.getTransactionRecords(this.searchParameters.start, this.searchParameters.end);
              this.getWithdrawal(this.searchParameters.start, this.searchParameters.end);
            } else {
              console.log('error', data)
            }
        }
        if(data.rid === `withdrawals-${this.ridWTimestamp}`){
          this.withdrawalArr = [...data.data.withdrawal_requests.request]
        }
      }
    })


  }


  mergeArrays(records, withdrawals){
     records.map(e => {
      withdrawals.map(f => {
        if (f.name !== 'Canceled' && e.date_time === f.date && Math.abs(e.amount) === Math.abs(f.amount) && e.operation === 12 && e.payment_system_name === f.payment_system_name) {
          e.withdrawal = f;
        }
      })
    })
  }


  test(e){
    //console.log(e);
  }
  getSelectOptions(){
    this.defaultTypeOption = {};
    this.selectTypeOption = [];
    this.jsonService.getJson(`transaction-${ this.translate.currentLang }`).subscribe(data => {
      this.defaultTypeOption = data["default"];
      this.selectTypeOption = data["options"];
    });
  }

  transactionType(type){
    if(type === 'deposit'){
      this.searchParameters.type = [];
      this.searchParameters.type = [3,10,303];
    } else if(type === 'withdraw'){
      this.searchParameters.type = [];
      this.searchParameters.type = [4,8,12,14,15,9];
    } else {
      this.searchParameters.type = [];
      this.searchParameters.type = [8,12,14,15,3,4,10,303,9];
    }
  }

  setDate(period){
    const today = new Date();
    const day = today.getDate();
    const month = today.getMonth();
    const year = today.getFullYear();
    this.fromDate = new Date(year, month, day - period);
    this.range.patchValue({
      start: this.fromDate
    })
    this.searchParameters.start = this.fromDate;
    if(period === 1){
      this.toDate = new Date(year, month, day - period);
      this.range.patchValue({
        end: this.toDate
      })
      this.searchParameters.end = this.toDate;
    } else {
      this.toDate = new Date();
      this.range.patchValue({
        end: this.toDate
      })
      this.searchParameters.end = this.toDate;
    }
    this.dateFromBtns = true;
  }


  getTransactionRecords(start, end){
    this.loading = true;
    this.ridTimestamp = new Date().getTime();

    this.websocket.sendMessage(   {
      "command": "balance_history",
      "params": {
        "where": {
          "from_date": start,
          "to_date": end,
        }
      },
      "rid": `OHB-DashboardHistoryTransactions-${this.ridTimestamp}`
    })

  }

  getWithdrawal(start, end){
    this.ridWTimestamp = new Date().getTime();
    this.websocket.sendMessage({
      "command": "get_withdrawals",
      "params": {
        "from_date": start,
        "to_date": end
      },
      "rid": `withdrawals-${this.ridWTimestamp}`
    })
  }

  searchTransactions() {
    this.searchParameters.start = this.range.value.start.startOf("day").unix();
    this.searchParameters.end = this.range.value.end.endOf("day").unix();
    this.getTransactionRecords(this.searchParameters.start, this.searchParameters.end);
    this.getWithdrawal(this.searchParameters.start, this.searchParameters.end);
  }

  filterTransactions(transactionType, data) {
    this.dataArray = [...data.filter(e => transactionType.includes(e.operation))];
    this.mergeArrays(this.dataArray, this.withdrawalArr);
  }

  returnAbs(val) {
    return Math.abs(val);
  }

  cancelRequest(id){
    this.withdrawCancelTimestamp = new Date().getTime();
    this.websocket.sendMessage({
      "command": "withdraw_cancel",
      "params": {
        "id": id
      },
      "rid": `WithdrawCancel-${this.withdrawCancelTimestamp}`
    })
  }

  getStatusByCode(code){
      return  TRANSACTION_STATUS[Number(code)][this.language];
  }

}
