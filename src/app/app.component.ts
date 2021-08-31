import { Component, Inject, OnInit, Renderer2, ViewEncapsulation } from '@angular/core';
import { SubscriptionsService } from './shared/services/subscriptions/subscriptions.service';
import { Subscription } from 'rxjs';
import { BetSlipService } from './shared/services/bet-slip/bet-slip.service';
import { WebsocketService } from './shared/services/websocket/websocket.service';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from "./shared/services/auth/auth.service";
import { ActivatedRoute, NavigationCancel, NavigationEnd, NavigationStart, Router } from '@angular/router';
import { WindowService } from './shared/services/window/window.service';
import { DOCUMENT } from '@angular/common';
import { UtilityService } from './shared/services/utility.service';

@Component({
  selector: 'workspace-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AppComponent implements OnInit {
  loading: boolean;
  title = 'frontend';
  touchDevice: boolean;
  betSlipState: boolean;
  betSlip: any = [];
  betslipChanges: Subscription;
  pageLang: string;
  languageChange: Subscription;
  hideLoader: boolean;
  isLoggedIn:boolean;
  isLogged: Subscription;
  isMobileCheck: Subscription;
  isMobile: boolean;
  constructor(
    @Inject(DOCUMENT) private document: Document,
    private renderer: Renderer2,
    private betslipService: BetSlipService,
    private websocketService: WebsocketService,
    private translate: TranslateService,
    private subscriptionsService: SubscriptionsService,
    private auth: AuthService,
    private router: Router,
    private windowService: WindowService,
    private actRoute: ActivatedRoute,
    private utility: UtilityService
  ) {
    this.actRoute.queryParams.subscribe(data => {
      if(data.openChat === 'true'){
       setTimeout(() => {
         if(!this.utility._isChatLoaded){
           this.utility.triggerLoadZendeskChat();
         }
       }, 50)
      }
    });
    this.isMobileCheck = this.windowService.onResize$.subscribe((data) => {
      if (data.width <= 997) {
        this.isMobile = true;
      } else {
        this.isMobile = false;
      }
    });
    this.isLogged = this.subscriptionsService.getIsLoggedIn().subscribe((data)=>{
      if(data){
        this.isLoggedIn = true;
      }
    })
    this.router.events
      .subscribe((event) => {
        if (event instanceof NavigationStart) {
          this.loading = true;
          this.hideLoader = false;
        } else if (event instanceof NavigationEnd || event instanceof NavigationCancel) {
          setTimeout(() => {
            this.loading = false;
          }, 1200);
          setTimeout(() => {
            this.hideLoader = true;
          }, 1500);
        }
      });

    translate.setDefaultLang('en');
    translate.use('en');
    localStorage.setItem('pageLanguage', this.translate.currentLang);

    if (localStorage.getItem('pageLanguage')) {
      this.websocketService.connect(localStorage.getItem('pageLanguage')).subscribe(data => {
        if (data.data && data.data.sid && typeof data.data === 'object') {
          localStorage.setItem('sessionId', data.data.sid);
          this.websocketService.socketInfo.next(true);
          setInterval(() => {
            this.websocketService.sendMessage({
              "command": "whats_up"
            });
          }, 60 * 1000);
        }
      });
    }
    this.touchDevice = 'ontouchstart' in document.documentElement;
    if (this.touchDevice) {
      this.renderer.addClass(document.body, 'touch');
    } else {
      this.renderer.removeClass(document.body, 'touch');
    }
    this.languageChange = this.subscriptionsService.getLanguage().subscribe(lang => {
      if(lang){
        this.websocketService.close();
        this.websocketService.connect(lang).subscribe(data => {
          if (data.data && data.data.sid && typeof data.data === 'object') {
            localStorage.setItem('sessionId', data.data.sid);
            this.websocketService.socketInfo.next(true);
          }
        });
      }
    })

    this.websocketService.reconnectWebsocket$.subscribe(data => {
      if(data){
        this.websocketService.close();
        window.location.reload();
        this.websocketService.connect(localStorage.getItem('pageLanguage')).subscribe(response => {
          if (data.data && data.data.sid && typeof data.data === 'object') {
            localStorage.setItem('sessionId', data.data.sid);
            this.websocketService.socketInfo.next(true);
            const authhData = JSON.parse(localStorage.getItem('100BetAuthData'));
            if(authhData !== null && authhData.user_id !== null && authhData.auth_token !== null){
              this.auth.RestoreToken(authhData.auth_token, authhData.user_id, authhData);
            } else {
              localStorage.removeItem('user');
              localStorage.removeItem('100BetAuthData');
            }
          }
        });
      }
    })

    console.log('%c 100BET', 'background: #084d8d; color: white; font-weight: 700; height:30px;line-height:30px; padding:0 15px;','v. 1.0;');
  }

  async ngOnInit() {
    const time = 1614162355982;
    if(!localStorage.getItem('100betStamp')){
      localStorage.setItem('100betStamp', (new Date().getTime()).toString())
    }
    if(Number(localStorage.getItem('100betStamp')) < time){
      localStorage.clear();
      window.location.reload();
    }
    if (this.windowService.getScreenSize() <= 992) {
      this.isMobile = true;
    } else {
      this.isMobile = false;
    }
    this.betslipService.initNewBetSlip();
    if(JSON.parse(localStorage.getItem('betSlip_cart'))['placedWithNoErrors']){
      this.betslipService.initNewBetSlip(true);
    }
    this.betSlipState = false;
    const authData = JSON.parse(localStorage.getItem('100BetAuthData'));
    if(authData !== null && authData.user_id !== null && authData.auth_token !== null){
      this.auth.RestoreToken(authData.auth_token, authData.user_id, authData);
    } else {
      localStorage.removeItem('user');
      localStorage.removeItem('100BetAuthData');
    }
    this.auth.GetPartnerData();
    setTimeout(() => {
      console.log('%c localStorage lang: ' + localStorage.getItem('pageLanguage'), 'color:green;');
      console.log('%c navigator lang: ' + navigator.language , 'color:green;');
      console.log('%c translateService lang: ' + this.translate.getBrowserLang(), 'color:green;');
      console.log('translateService obj:', this.translate.store);
    }, 500)
  }
  menufunction(e) {
    const element = this.document.getElementsByTagName('html');
    if (e) {
      this.renderer.addClass(document.body, 'noscroll');
      this.renderer.addClass(element[0], 'noscroll');
    } else {
      this.renderer.removeClass(document.body, 'noscroll');
      this.renderer.removeClass(element[0], 'noscroll');
    }
  }
}
