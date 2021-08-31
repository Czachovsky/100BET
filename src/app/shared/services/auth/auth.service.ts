import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { WebsocketService } from '../websocket/websocket.service';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';
import { interval, Observable, Subscription } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { TranslateService } from '@ngx-translate/core';
import * as _ from 'lodash';
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  checkBalance: Subscription;
  loggedInUser: boolean;
  partnerData: any;
  userInfo: any;
  userId:any;
  userDataSubId: any;
  tempUserData: any;
  constructor(
    private router: Router,
    private websocket: WebsocketService,
    private subscriptions: SubscriptionsService,
    private translate: TranslateService
  ) {
    this.websocket.isOpenSocket$.subscribe((socket) => {
      if (socket) {
        this.websocket.getData().subscribe((data) => {
          if (data.rid === 'OHB-login') {
            if (data.code || data.msg) {
              console.log(data.code, data.msg, data.data.details.Message);
              this.subscriptions.sendError({
                isError: true,
                errorMsg: data.data.details.Message,
              });
              localStorage.removeItem('user');
              localStorage.removeItem('user');
              localStorage.removeItem('100BetAuthData');
            } else {
              const authData = data.data;
              if(localStorage.getItem('100BetRememberMe') && localStorage.getItem('100BetRememberMe') !== ''){
                authData['expiration'] = 'never';
              } else {
                authData['expiration'] = new Date().getTime() + 3600000;
              }
              localStorage.setItem('100BetAuthData',  JSON.stringify(authData));
               this.subscribeForUserRealTimeData()
               this.loggedInUser = true;
               this.userId = data.data.user_id;
            //   this.pingBC();
            }
          }
          if (data.rid === 'OHB-logout') {
            localStorage.removeItem('100BetRememberMe');
            localStorage.removeItem('100BetAuthData');
            localStorage.removeItem('user');
            this.subscriptions.setIsLoggedIn(false);
            this.pingBC().unsubscribe();
            if (this.router.url.includes('my-bets') || this.router.url.includes('dashboard')) {
              this.router.navigate(['/sportsbook/home']);
            }
          }
          if (data.rid === 'OHB-getBalance') {
           // console.log(data);
          }
          if(data.rid === 'OHB-user_datas') {
            // this.userInfo = data.data;
            // this.userInfo.language === 'en' ? this.setNewLanguage('en') : this.setNewLanguage('zh');
            // localStorage.setItem('user', JSON.stringify(data.data));
            // this.subscriptions.setIfGetUserInfo(true);
            // this.subscriptions.setIsLoggedIn(true);
          }
          if(data.rid === 'GetPartnerData16099445099629'){
            this.partnerData = data.data.data.partner[environment.settings.siteID];
          }
          if(data.rid === '161100099460215sendSmsWithCode'){
            if(data.data.result === 0){
              console.log('SEND SMS WITH CODE')
            } else {
              console.log('ERROR - SEND SMS WITH CODE - ERROR')
            }
          }
          if(data.rid === '161159309014515UsrInfo'){
            this.userInfo = data.data.data.profile[this.userId];
            localStorage.setItem('user', JSON.stringify(data.data.data.profile[this.userId]));
            data.data.data.profile[this.userId].language === 'en' ? this.setNewLanguage('en') : this.setNewLanguage('zh');
            this.subscriptions.setIfGetUserInfo(true);
            this.subscriptions.setIsLoggedIn(true);
            this.userDataSubId = data.data.subid;
            this.tempUserData = data.data.data.profile[this.userId];
          }
          if (data.data !== null && data.data[this.userDataSubId]) {
            const tempBodyObj = Object.assign({}, _.mergeWith(
              {},
              this.tempUserData,
              data.data[this.userDataSubId].profile[this.userId]));
            this.tempUserData =  Object.assign({},tempBodyObj);
            this.userInfo = Object.assign({}, this.tempUserData);
            this.subscriptions.setIfGetUserInfo(true);
          }
        });
      }
    });
  }

  subscribeForUserRealTimeData(){
    this.websocket.sendMessage({
      "command": "get",
      "params": {
        "source": "user",
        "what": {
          "profile": []
        },
        "subscribe": true
      },
      "rid": "161159309014515UsrInfo"
    })
  }

  setNewLanguage(language){
    if(localStorage.getItem('pageLanguage') !== language && !localStorage.getItem('pageLanguageByUser')){
      localStorage.setItem('pageLanguage', language);
      this.translate.use(language);
      this.subscriptions.setLanguage(language);
      setTimeout(() => {
        window.location.reload();
      }, 100)
    }
  }

  get parterDataObj():object{
    return this.partnerData;
  }

  get isLoggedIn(): boolean {
    const user = JSON.parse(localStorage.getItem('user'));
    const authData = JSON.parse(localStorage.getItem('100BetAuthData'));
    return user !== null && authData !== null;
  }

  get userData(): object {
    return JSON.parse(localStorage.getItem('user'));
  }

  get authData(): object {
    return JSON.parse(localStorage.getItem('100BetAuthData'));
  }
  get userInfoObject(): object{
    return this.userInfo;
  }

  SignIn(username, password) {
    this.websocket.sendMessage({
      command: 'login',
      params: {
        username: username,
        password: password,
        g_recaptcha_response: '',
        site_key: '6LdMYKMUAAAAAJ1z97OvjlrEhOAzc81yMZiXceZq',
      },
      rid: 'OHB-login',
    });
  }

  pingBC(): Subscription {
    return (this.checkBalance = interval(60000).subscribe((data) => {
      this.websocket.sendMessage({"command":"get","params":{"source":"partner.config","what":{"partner":[]},"subscribe":false},"rid":"GetPartnerData16099445099629"}	);
    }));
  }

  SignOut() {
    this.websocket.sendMessage({
      command: 'logout',
      rid: 'OHB-logout',
    });
    this.websocket.sendMessage({
      "command": "unsubscribe",
      "params": {
        "subid": this.userDataSubId
      }
    });
   // this.checkBalance.unsubscribe();
  }

  RestoreToken(token, userId, authobj) {
    if (authobj.expiration === 'never') {
      this.websocket.sendMessage({
        command: 'restore_login',
        params: {
          user_id: userId,
          auth_token: token
        },
        rid: 'OHB-login'
      });
    } else {
      const ts = new Date().getTime();
      if (authobj.expiration > ts) {
        this.websocket.sendMessage({
          command: 'restore_login',
          params: {
            user_id: userId,
            auth_token: token
          },
          rid: 'OHB-login'
        });
      } else {
        localStorage.removeItem('100BetRememberMe');
        localStorage.removeItem('100BetAuthData');
        localStorage.removeItem('user');
        this.subscriptions.setIsLoggedIn(false);
      }
    }
  }

  RegisterUser(registerForm) {
    this.websocket.sendMessage({
      command: 'register_user',
      params: {
        user_info: {
          username: registerForm.user_name,
          password: registerForm.password,
          first_name: registerForm.user_full_name,
          lang_code: localStorage.getItem('pageLanguage'),
          email: registerForm.email,
          phone: registerForm.phone_number.e164Number.replace('+', ''),
          currency_name: 'CNY',
          g_recaptcha_response: registerForm.recaptcha,
          encrypted_token: false,
          confirmation_code: Number(registerForm.verification_code)
        },
      },
      rid: 'OHB-regstration',
      site_key: '6LdMYKMUAAAAAJ1z97OvjlrEhOAzc81yMZiXceZq',
    });
  }

  PasswordReset(email) {
    this.websocket.sendMessage({
      command: 'forgot_password',
      params: {
        email: email,
      },
      rid: 'OHB-pass-reset',
    });
  }

  GetUserInfo(){
    this.websocket.sendMessage({
      command: 'get_user',
      rid: 'OHB-user_datas',
    })
  }

  GetPartnerData(){
      this.websocket.sendMessage({"command":"get","params":{"source":"partner.config","what":{"partner":[]},"subscribe":false},"rid":"GetPartnerData16099445099629"}	)
  }

  loginByJWE(token){
    this.websocket.sendMessage({"command": "login_encrypted", "params": {"jwe_token": token},"rid": 'OHB-login'});
  }

  sendForSmsCode(phone_number, action){
    // action - Registration = 1, Login = 2, Password Change = 3
    this.websocket.sendMessage({
      "command": "send_sms_to_phone_number",
      "params": {
        "action_type": action,
        "phone_number": phone_number
      },
      "rid": "161100099460215sendSmsWithCode"
    }	)
  }
}
