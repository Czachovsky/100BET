import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../shared/services/auth/auth.service';
// @ts-ignore
import { default as _rollupMoment } from 'moment';
import * as _moment from 'moment';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { WebsocketService } from '../../../shared/services/websocket/websocket.service';
import { SubscriptionsService } from '../../../shared/services/subscriptions/subscriptions.service';
import { JsonService } from '../../../shared/services/json/json.service';
import { TranslateService } from '@ngx-translate/core';
import { OddsService } from '../../../shared/services/odds/odds.service';
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
  selector: 'workspace-account-details',
  templateUrl: './account-details.component.html',
  styleUrls: ['./account-details.component.scss'],
  providers: [
    {provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE]},
    {provide: MAT_DATE_FORMATS, useValue: localeCode === 'en' ? MY_FORMATS : MY_FORMATS_ZH}]
})
export class AccountDetailsComponent implements OnInit {
  error: any;
  whatDoYouWannaUpdate: any;
  userInfo: any;
  showChangePasswordModal: boolean;
  passwordChanged: boolean;
  modalText: any;
  birthDateChanged: boolean;
  updateObj: any;
  minDate: any;
  maxDate: any;
  ridTimestamp: any;
  typePassword:  boolean;
  nDate: any;
  passwordError = '';
  loader: boolean;
  dateLoader: boolean;
  userPass: any;
  valToChange: any;
  selectedLanguage: any =   {};
  selectedOddType: any = {};
  languageOptions: any = [
    {
      "optionName": 'en',
      "optionDisplayName": "english",
      "optionValue": "en"
    },
    {
      "optionName": 'zh',
      "optionDisplayName": "chinese",
      "optionValue": "zh"
    }
  ];
  oddTypeOptions: any = [];
  constructor(private auth: AuthService,
              private websocket: WebsocketService,
              private subscription: SubscriptionsService,
              private translate: TranslateService,
              private jsonService: JsonService,
              private os: OddsService) {
    const currentYear = new Date().getFullYear();
    this.minDate = new Date(currentYear - 100, 0, 0);
    this.maxDate = new Date();
    this.maxDate = this.maxDate.setFullYear(this.maxDate.getFullYear()-18);
    this.maxDate = new Date(this.maxDate);
    this.subscription.checkIfGetUserInfo().subscribe(data => {
      this.userInfo = this.auth.userInfoObject;
    })
  }

  ngOnInit(): void {
    this.userInfo = this.auth.userInfoObject;
    if (this.userInfo.language === 'en') {
      this.selectedLanguage = {
        'optionName': 'en',
        'optionDisplayName': 'english',
        'optionValue': 'en'
      };
    } else {
      this.selectedLanguage = {
        'optionName': 'zh',
        'optionDisplayName': 'chinese',
        'optionValue': 'zh'
      };
    }
    this.jsonService.getJson(`odds-format-${ this.translate.currentLang }`).subscribe(data => {
      if(localStorage.getItem('100BetOddFormat')){
        this.selectedOddType = data['options'].filter(e => e.optionName === localStorage.getItem('100BetOddFormat'))[0];
      } else {
        this.selectedOddType = data["default"];
      }
      this.oddTypeOptions = data["options"];

    })
    this.websocket.getData().subscribe(data => {
      if (data.data && data.data !== 'null' && data.data !== 'undefined') {
        if (data.rid === `updateUserData-${this.ridTimestamp}`) {
          this.loader = false;
          if (data.code === 0 && data.data.result === 0) {
            this.error = '';
              this.passwordChanged = true;
          } else {
            this.error = `${data.data.details}`
            console.log(this.error)
          }
        }
      }
    })
  }


  updateUserData(what, value) {
    this.error = '';
    this.updateObj = Object.assign({}, {
      'password': ''
    });
    if (what === 'birthday') {
      if (value.value && value.value !== '') {
        const d = value.value.split('/');
        this.whatDoYouWannaUpdate = 'birthday';
        this.typePassword = true;
        this.updateObj.birth_date = `${d[2]}-${d[1]}-${d[0]}`;
      }

    } else if (what === 'language') {
      this.ridTimestamp = new Date().getTime();
      this.whatDoYouWannaUpdate = 'language';
      this.updateObj.lang_code = value.optionValue;
      this.websocket.sendMessage({
        'command': 'set_preferred_language',
        'params': {
          'language': value.optionValue
        },
        'rid': `updateUserData-${this.ridTimestamp}`
      });


    } else if (what === 'phone') {
      if (value.value && value.value !== '') {
        this.whatDoYouWannaUpdate = 'phone';
        this.typePassword = true;
        this.updateObj.mobile_phone = value.value;
      }
    }
  }


  sendUpdateMessage(obj){
    this.ridTimestamp = new Date().getTime();
    this.websocket.sendMessage({
      "command": "update_user",
      "params": {
        "user_info": obj
      },
      "rid": `updateUserData-${this.ridTimestamp}`
    })
  }


  submitPassword(event){
    this.typePassword = false;
    this.loader = true;
    this.updateObj.password = event;
    this.sendUpdateMessage(this.updateObj);
  }




  getIfChangesSuccessfully(e){
    if(e){
      this.showChangePasswordModal = false;
      this.passwordChanged = true;
      this.whatDoYouWannaUpdate = 'password';
    }
  }

  saveBirthDate(date){
    if(date.value && date.value !== ''){
      this.whatDoYouWannaUpdate = 'birth_date';
      this.passwordError = '';
      this.typePassword = true;
      this.ridTimestamp = new Date().getTime();
      const d = date.value.split('/');
      this.nDate = `${d[2]}-${d[1]}-${d[0]}`;
      this.valToChange = `${d[2]}-${d[1]}-${d[0]}`;
    }
  }

  submitUserPassword(password){
    if(password && password !== ''){
      this.dateLoader = true;
         const _obj = {password: password};
        switch (this.whatDoYouWannaUpdate) {
          case 'birth_date':
            _obj['birth_date'] = this.valToChange;
            break;
          case 'language':
            _obj['lang_code'] = this.valToChange;
            break;
          default:
            break;
        }
      //  this.submitUpdate(this.whatDoYouWannaUpdate, _obj);
    }
  }

  submitUpdate(what, obj){
    this.ridTimestamp = new Date().getTime();
    this.websocket.sendMessage({
      "command": "update_user",
      "params": {
        "user_info": obj
      },
      "rid": `updateUserData-${this.ridTimestamp}`
    })
  }

  _submitPassword(event){
      if(event && event !== ''){
        this.userPass = event;
        this.typePassword = false;
        this.dateLoader = true;
        if(this.whatDoYouWannaUpdate === 'language'){

        } else if(this.whatDoYouWannaUpdate === 'email'){

        } else if(this.whatDoYouWannaUpdate === 'password'){

        }else if(this.whatDoYouWannaUpdate === 'mobile'){

        }
        this.updateObj = {
          "user_info": {
            "password": event
          }
        }

        // this.websocket.sendMessage({
        //   "command": "update_user",
        //   "params": {
        //     "user_info": {
        //       "password": event,
        //       "birth_date": this.nDate
        //     }
        //   },
        //   "rid": `saveBirthDate-${this.ridTimestamp}`
        // })
      }
  }

  changeLanguage(e){
    this.whatDoYouWannaUpdate = 'language';
    this.typePassword = true;
  }

  changeOddFormat(e){
    localStorage.setItem('100BetOddFormat', e.optionName)
    this.os.setOddsFormat();
  }
}
