import { Component, OnDestroy, OnInit, Renderer2, TemplateRef, ViewChild } from '@angular/core';
import { HttpService } from '../../shared/services/http/http.service';
import { environment } from '../../../environments/environment.prod';
import { TranslateService } from '@ngx-translate/core';
import { Subject, Subscription } from 'rxjs';
import { SubscriptionsService } from '../../shared/services/subscriptions/subscriptions.service';
import { PerfectScrollbarComponent } from 'ngx-perfect-scrollbar';
import { WindowService } from '../../shared/services/window/window.service';
import { AuthService } from '../../shared/services/auth/auth.service';
@Component({
  selector: 'workspace-casino',
  templateUrl: './casino.component.html',
  styleUrls: ['./casino.component.scss']
})
export class CasinoComponent implements OnInit, OnDestroy {
  @ViewChild(PerfectScrollbarComponent) componentRef?: PerfectScrollbarComponent;
  casinoCategories: any = [];
  casinoProviders: any = [];
  allProviders: string;
  allCategories: string;
  runGame: boolean;
  runGameSubscription: Subscription;
  runGameObj: any;
  isMobile: boolean;
  isMobileCheck: Subscription;
  showSearchSub: Subscription;
  isLogged: Subscription;
  showSearch: boolean;
  runGameAfterLogin: boolean;
  gameToRun: any;
  depositError: boolean;
  constructor(private renderer: Renderer2,
              private http: HttpService,
              private translate: TranslateService,
              private subscription: SubscriptionsService,
              private windowService: WindowService,
              private auth: AuthService) {
    this.isLogged = this.subscription.getIsLoggedIn().subscribe((data)=>{
      if(this.runGameAfterLogin && data){
        this.handleRunGame(this.gameToRun);
      } else if(!data){
        this.runGame = false;
        this.subscription.setShowLogin(false);
      }
    });
    this.showSearchSub = this.subscription.getShowCasinoSearch().subscribe(data => {
      if(data){
        this.showSearch = true;
      }
    })
    this.isMobileCheck = this.windowService.onResize$.subscribe((data) => {
      if (data.width <= 997) {
        this.isMobile = true;
      } else {
        this.isMobile = false;
      }
    });
    this.runGameSubscription = this.subscription.getRunGameObj().subscribe(obj => {
      if(obj){
        this.runGame = true;
        this.runGameObj = obj;
        setTimeout(() => {
          this.componentRef.directiveRef.scrollToTop(0, 500);
        },500)
      }
    })

    if(!localStorage.getItem('100BetCasino')){
      localStorage.setItem('100BetCasino', '{"recent":[], "favouriteGames":[], "provider": "", "category": ""}');
    }

    this.http.callRequest(`getOptions?partner_id=${environment.settings.siteID}`, 'POST', '', true)
      .subscribe(response => {
        if(response.status === 'ok'){
          if(response.providers.length){
            this.translate.get('casino.c11').subscribe(x => {
              this.allProviders = x;
              this.casinoProviders = [...response.providers];
              this.casinoProviders.unshift({title: this.allProviders, name: 'all_providers', selected: true})
              this.casinoProviders.map((e,i) => {
                i > 20 ? e.hidden = true : e.hidden = false;
              })
              this.translate.get('casino.c12').subscribe(y => {
                this.casinoProviders.push({title: y, name: 'show_all'})
              });
            });

            if(JSON.parse(localStorage.getItem('100BetCasino'))['provider'] !== ''){
              this.casinoProviders.map(e => {
                if(e.name === JSON.parse(localStorage.getItem('100BetCasino'))['provider']){
                  e.selected = true;
                } else {
                  e.selected = false;
                }
              })
            }
          }
          if(response.categories.length){
            const categories = ['PopularGames', 'favourite', 'New', 'LiveDealer', 'TopSlots', 'TableGames', 'LotteryGames', 'ScratchGames', 'BettingGame']
            this.translate.get('casino.cSort.all').subscribe(x => {
              this.allCategories = x;
            });

            this.casinoCategories = [...response.categories.filter(e => categories.includes(e.name))];
            if(JSON.parse(localStorage.getItem('100BetCasino'))['category'] !== ''){
              this.casinoCategories.unshift({title: this.allCategories, id: 'all_categories', name: 'all_categories', selected: false})
              this.casinoCategories.map(e => {
                if(e.id === JSON.parse(localStorage.getItem('100BetCasino'))['category']){
                  e.selected = true;
                } else {
                  e.selected = false;
                }
              })
            } else  {
              this.casinoCategories.unshift({title: this.allCategories,id: 'all_categories', name: 'all_categories', selected: true})
            }
          }
        }
      })
  }

  ngOnInit(): void {
    this.renderer.addClass(document.body, 'OHBCasino');



  }

  ngOnDestroy() {
    this.renderer.removeClass(document.body, 'OHBCasino');
  }
  getGameClose(e){
    if(e){
      this.runGame = false;
    }
  }
  handleRunGame(game){
    this.showSearch = false;
    if (!this.auth.isLoggedIn){
      this.subscription.setShowLogin(true);
      this.runGameAfterLogin = true;
      this.gameToRun = game;
      this.gameToRun.runType = game.runType;
    } else {
      if(this.auth.userInfoObject['balance'] === 0 && game.runType === 'real'){
        this.depositError = true;
      } else {
        game.runType = game.runType;
        this.subscription.setRunGameObj(game);
      }
    }
  }
}
