import {
  AfterViewInit,
  Component,
  ElementRef, Inject, OnDestroy,
  OnInit,
  Renderer2,
  TemplateRef,
  ViewChild
} from '@angular/core';
import { SubscriptionsService } from "../../shared/services/subscriptions/subscriptions.service";
import { Subscription } from "rxjs";
import { AuthService } from "../../shared/services/auth/auth.service";
import { filter, map } from "rxjs/operators";
import { ActivationEnd, NavigationEnd, Router, ActivatedRoute } from "@angular/router";
import { WebsocketService } from '../../shared/services/websocket/websocket.service';
import { DOCUMENT } from '@angular/common';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { DecimalPipe } from '@angular/common';
import { environment } from '../../../environments/environment';
import { UtilityService } from '../../shared/services/utility.service';
@Component({
  selector: 'workspace-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss']
})
export class NavigationComponent implements OnInit, AfterViewInit, OnDestroy {

  showLogin: Boolean;
  showRegister: Boolean;
  isLogged: Subscription;
  isLoggedIn: Boolean;
  showRegSub: Subscription;
  showLogSub: Subscription;
  showMobileMenu: any;
  public _routerSub = Subscription.EMPTY;
  ridTimestamp: any;
  showUserMenu: Boolean;
  isBalanceHidden: Boolean;
  userData: any;
  completeRegistration: Boolean;
  clientClaimableDepositBonuses: Number = 0;
  loadingChat: Boolean;
  showPasswordRecover: Boolean;
  betsCount: any;
  withdrawable: any;
  showSearch: Boolean = true;
  activeMenu = '';
  ShowNav: Boolean;
  chatLoadSubscription: Subscription;
  resetBySms: Boolean;
  isCasino: boolean;
  constructor(private el: ElementRef,
    private renderer: Renderer2,
    public subscriptionsService: SubscriptionsService,
    private auth: AuthService,
    private router: Router,
    private websocket: WebsocketService,
    public dialog: MatDialog,
    @Inject(DOCUMENT) private document: Document,
    private decimal: DecimalPipe,
    public utility: UtilityService) {

    this.chatLoadSubscription = this.utility.isChatLoaded$.subscribe(data => {
        this.loadingChat = false;
    })
    this.subscriptionsService.getShowResetSuccessfull().subscribe(data => {
      if(data) {
        this.resetBySms = true;
        this.showPasswordRecover = false;
      }
    })
    this.subscriptionsService.checkIfGetUserInfo().subscribe(data => {
      if (data) {
        this.userData = this.auth.userInfoObject;
        this.getBonusCount();
        this.getBetHistory();
        this.calculateWithdrawableBalance(this.userData);
      }
    })

    if (localStorage.getItem('OHB_HideBalance')) {
      this.isBalanceHidden = true;
      this.subscriptionsService.setIfBanalceHidden(true);
    }
    router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.showMobileMenu = (router.url.indexOf('/sportsbook/') !== -1 && router.url !== '/sportsbook/home');
        this.ShowNav = !event.url.includes('help');
      }
    });
    this.isLogged = this.subscriptionsService.getIsLoggedIn().subscribe((data) => {
      if (data) {
        this.userData = this.auth.userData;
        this.calculateWithdrawableBalance(this.userData);
        this.showLogin = false;
        this.showRegister = false;
        this.isLoggedIn = true;
        const element = this.document.getElementsByTagName('html');
        this.renderer.removeClass(document.body, 'modal-open');
        this.renderer.removeClass(element[0], 'modal-open');
      }
    })

    this.subscriptionsService.getLanguage().subscribe(async lang => {
      if (lang) {
        setTimeout(() => {
          this.bottomLinePosition()
        }, 500)
      }
    });
    this._routerSub = this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        setTimeout(() => {
          this.bottomLinePosition()
        }, 500)
      }
    });
    this.showLogSub = this.subscriptionsService.getShowLogin().subscribe(data => {
      if (data) {
        this.showLogin = true;
        this.showRegister = false;
      }
    })
    this.showRegSub = this.subscriptionsService.getShowRegister().subscribe(data => {
      if (data) {
        this.showLogin = false;
        this.showRegister = true;
      }
    })
    this.subscriptionsService.getIfBetComplete().subscribe(data => {
      if (data) {
        this.getBetHistory();
      }
    })
    this.subscriptionsService.getCloseModal().subscribe(data => {
      if (data) {
        this.activeMenu = '';
      }
    })
    this.router.events.pipe(
      filter((event) => event instanceof ActivationEnd))
      .subscribe((event) => {
        this.router.url.includes('casino') ? this.isCasino = true : this.isCasino = false;
      });
  }

  @ViewChild('bottomLine', { static: false }) bottomLine: ElementRef;
  @ViewChild('mainNavbar', { static: false }) mainNavbar: ElementRef;
  @ViewChild('searchDialog', { static: true }) searchDialog: TemplateRef<any>;
  openDialogWithTemplateRef(templateRef: TemplateRef<any>) {
    this.dialog.open(templateRef);
  }

  ngOnDestroy() {
    if(this.chatLoadSubscription){
      this.chatLoadSubscription.unsubscribe();
    }
  }

  ngOnInit() {
    window.location.href.includes('casino') ? this.isCasino = true : this.isCasino = false;
    console.log(this.router.url)
    if(this.router.url.includes('help')){
      this.showMobileMenu = true;
    }
    setTimeout(() => {
      if (this.router.url.includes('sportsbook')) {
        this.showSearch = true;
      }
      else {
        this.showSearch = false;
      }
    }, 500)

    this.betsCount = 0;
    this.websocket.getData().subscribe(data => {
      if (data.data && data.data !== 'null' && data.data !== 'undefined') {
        if (data.rid === 'get_client_claimable_bonuses_count') {
          if (data.data.details) {
            this.clientClaimableDepositBonuses = data.data.details;
          }
        }
        if (data.rid === `bet-history-${this.ridTimestamp}`) {
          if (data.data.result === '-2455') {
            console.log('waiting....')
          } else {
            this.betsCount = data.data.bets.filter(e => e.outcome === 0).length;
          }
        }
      }
    });
  }
  hangleShowRecover(e) {
    this.showPasswordRecover = e;
    this.showLogin = !e;
  }

  getBonusCount() {
    this.websocket.sendMessage({
      'command': 'get_client_claimable_bonuses_count',
      'params': {},
      "rid": "get_client_claimable_bonuses_count"
    });
  }

  async ngAfterViewInit() {
    setTimeout(() => {
      this.bottomLinePosition()
    }, 500)
  }

  redirect(tab) {
    this.completeRegistration = false;
    this.router.navigate(['/dashboard'], { queryParams: { tab } })
  }

  bottomLinePosition(el?: any) {
    if (el && !el.target.classList.contains('navigation__active')) {
      const activeElement = el.target;
      const { width: activeElWidth, x: activeElX } = activeElement.getBoundingClientRect();
      const { x: parentX } = this.mainNavbar.nativeElement.getBoundingClientRect();
      if (this.bottomLine.nativeElement) {
        this.renderer.setStyle(this.bottomLine.nativeElement, 'left', `${activeElX - parentX}px`);
        this.renderer.setStyle(this.bottomLine.nativeElement, 'width', `${activeElWidth}px`);
      }
    } else {
      const activeElement = this.el.nativeElement.querySelectorAll('a.navigation__active');
      if (activeElement.length) {
        const { width: activeElWidth, x: activeElX } = activeElement[0].getBoundingClientRect();
        const { x: parentX } = this.mainNavbar.nativeElement.getBoundingClientRect();
        if (this.bottomLine.nativeElement) {
          this.renderer.setStyle(this.bottomLine.nativeElement, 'left', `${activeElX - parentX}px`);
          this.renderer.setStyle(this.bottomLine.nativeElement, 'width', `${activeElWidth}px`);
        }
      }
    }
  }

  logInAction(e) {
    e.preventDefault();
    this.showRegister = false;
    this.showLogin = true;
  }

  registerAction(e) {
    e.preventDefault();
    this.showLogin = false;
    this.showRegister = true;
  }

  changeLang(e, lang) {
    e.preventDefault();
    localStorage.setItem('pageLanguage', lang);
    setTimeout(() => {
      this.bottomLinePosition();
    }, 100)
  }

  logOut(e) {
    e.preventDefault();
    this.subscriptionsService.setIsLoggedIn(false);
    this.isLoggedIn = false;
    this.showRegister = false;
    this.isLoggedIn = false;
    this.auth.SignOut();
    this.userData = null;
    this.showUserMenu = false;
  }

  hideUserBalance() {
    if (!localStorage.getItem('OHB_HideBalance')) {
      localStorage.setItem('OHB_HideBalance', JSON.stringify({ data: true }));
      this.isBalanceHidden = true;
      this.subscriptionsService.setIfBanalceHidden(true);
    } else {
      localStorage.removeItem('OHB_HideBalance');
      this.isBalanceHidden = false;
      this.subscriptionsService.setIfBanalceHidden(false);
    }
  }

  goToDashboardSection(section) {
    this.showUserMenu = false;
    this.router.navigate(['dashboard'], { queryParams: { "tab": section } });
  }

  showRegisteredModal(e) {
    if (e) {
      this.showRegister = false;
      this.completeRegistration = true;
    }
  }

  loadChat() {
    if(!this.utility._isChatLoaded){
      this.loadingChat = true;
      this.utility.triggerLoadZendeskChat();
    } else {
      this.utility.hideOrShowChat();
    }
  }

  openSearch() {
    console.log(this.router.url.includes('promotion'), this.router.url)
    if (this.router.url.includes('casino')) {
      this.subscriptionsService.setShowCasinoSearch(true);
    } else if (this.router.url.includes('sportsbook/home')) {
      this.subscriptionsService.setShowHomeSearch(true);
    } else if (this.router.url.includes('promotion')) {
      this.subscriptionsService.setShowHomeSearch(true);
    }
  }

  showAdvancedSearch() {
    this.subscriptionsService.setShowHomeSearch(true);
  }

  getBetHistory() {
    this.ridTimestamp = new Date().getTime();
    this.websocket.sendMessage({
      'command': 'bet_history',
      'params': {
        'where': {
          'from_date': Math.round((new Date().getTime() - 86400000) / 1000),
          'to_date': Math.round(new Date().getTime() / 1000),
          'with_pool_bets': true
        }
      },
      'rid': `bet-history-${this.ridTimestamp}`
    })
  }

  calculateWithdrawableBalance(userData) {
    this.withdrawable = this.decimal.transform(userData.balance - userData.unplayed_balance - userData.bonus_balance, '1.2-2');
  }
  changeSearchStatus(status: Boolean) {
    this.showSearch = status;
  }

  openLogin(){
    this.resetBySms = false;
    this.showLogin = true;
  }

  loadPopularGames(){
    this.subscriptionsService.setLoadPopular(true);
  }
}
