import {
  AfterViewChecked, AfterViewInit,
  ChangeDetectorRef,
  Component, Inject,
  Input,
  OnChanges,
  OnInit,
  Renderer2,
  SimpleChanges
} from '@angular/core';
import { HttpService } from '../../../shared/services/http/http.service';
import { environment } from '../../../../environments/environment.prod';
import { Subscription } from 'rxjs';
import { SubscriptionsService } from '../../../shared/services/subscriptions/subscriptions.service';
import { AuthService } from '../../../shared/services/auth/auth.service';
import { CasinoGameService } from '../../../shared/services/casino/casino-game.service';
import { WindowService } from '../../../shared/services/window/window.service';
import { ActivatedRoute, Router } from '@angular/router';
import { DOCUMENT } from '@angular/common';
import * as _ from 'lodash';
@Component({
  selector: 'workspace-casino-games',
  templateUrl: './casino-games.component.html',
  styleUrls: ['./casino-games.component.scss']
})
export class CasinoGamesComponent implements OnInit, OnChanges, AfterViewInit {
  @Input() casinoCategories: any = [];
  @Input() providers: any[];
  gameList: any = [];
  gameOffset: number;
  gameLimit: number;
  selectedProvider: string;
  showLoadMore: boolean;
  gamesLeft: number;
  isLoggedIn: boolean;
  isLogged: Subscription;
  runGameAfterLogin: boolean;
  gameToRun: any;
  gamesSubscription: Subscription;
  showMoreSub: Subscription;
  runType: any;
  isMobileCheck: Subscription;
  isMobile: boolean;
  showMobileFilters:boolean;
  showFiltersSubscription: Subscription;
  getGameSubscription: Subscription;
  depositError: boolean;
  constructor(private http: HttpService,
              private subscriptionsService: SubscriptionsService,
              private auth: AuthService,
              private casino: CasinoGameService,
              private rs: WindowService,
              private renderer: Renderer2,
              private router: Router,
              @Inject(DOCUMENT) private document: Document) {
    this.showFiltersSubscription = this.subscriptionsService.getShowCasinoFilters().subscribe(data => {
            this.showMobileFilters = data;
    })
    this.getGameSubscription = this.subscriptionsService.getCasinoCategory().subscribe(data => {
      this.casino.getCasinoGames(true, true, false, data);
    })
    this.isMobileCheck = this.rs.onResize$.subscribe((data) => {
      if (data.width <= 997) {
        this.isMobile = true;
      } else {
        this.isMobile = false;
      }
    });
    this.isLogged = this.subscriptionsService.getIsLoggedIn().subscribe((data)=>{
      this.isLoggedIn = data;
      if(this.runGameAfterLogin){
        this.runGame(this.gameToRun, this.runType);
      }
    });
    this.gamesSubscription = this.subscriptionsService.getCasinoGamesObj().subscribe(data => {
      this.gameList = data;
      setTimeout(() => {
        this.gameList.map(e => e.loaded = true);
      },500);
    });
    this.showMoreSub = this.subscriptionsService.getShowMoreGames().subscribe(data => {
      this.showLoadMore = data;
    })
  }

  runGameFromHomePage(){
    setTimeout(() => {
      this.runGame(this.casino.getRunGameData, this.casino.getRunGameData.runType);
      this.casino.setRunGameData('');
    },0)
  }

ngAfterViewInit() {
  if(this.casino.getRunGameData){
    this.runGameFromHomePage();
  }

}

  ngOnInit(): void {
    this.casino.freshStart();
    this.rs.getScreenSize() <= 997 ? this.isMobile = true : this.isMobile = false;
    this.gameOffset = 0;
    this.gameLimit = 10;
    this.casino.getCasinoGames(true, false);
    this.selectedProvider = 'all_providers';
  }


  ngOnChanges(changes: SimpleChanges) {
    if (changes['providers'] && changes['providers'].currentValue) {
      this.providers = [...changes['providers'].currentValue]
    }
    if (changes['casinoCategories'] && changes['casinoCategories'].currentValue) {
      this.casinoCategories = [...changes['casinoCategories'].currentValue]
    }
  }

  selectProvider(provider){
    if(!provider.selected){
      if(provider.name !== "show_all"){
        provider.selected = true;
        this.providers.map(el => {
          if (el.name !== provider.name) {
            el.selected = false;
          }
        });
        this.gameOffset = 0;
        this.gameLimit = 10;
        this.selectedProvider = provider.name;
        if(!this.isMobile){
          this.casino.getCasinoGames(true, true, provider.name);
        } else {
          this.casino.setMobileProvider(provider.name);
        }

      } else {
        this.providers.map(e => {
          e.hidden = false;
        });
        provider.hidden = true;
      }
    }
  }

  loadMoreGames(){
    this.casino.getCasinoGames(false, false);
  }

  favouriteGame(game) {
    const casinoObj = JSON.parse(localStorage.getItem('100BetCasino'));
    if (!game.favouriteGame) {
      game.favouriteGame = true;
      casinoObj['favouriteGames'].push(game.id);
    } else {
      game.favouriteGame = false;
      casinoObj['favouriteGames'].filter(e => e !== game.id);
    }
    this.gameList = [..._.sortBy(this.gameList, [o => !o.favouriteGame])];
    localStorage.setItem('100BetCasino', JSON.stringify(casinoObj));
  }

  runGame(game, runType){
    this.runType = runType;
    if (!this.auth.isLoggedIn){
      this.subscriptionsService.setShowLogin(true);
      this.runGameAfterLogin = true;
      this.gameToRun = game;
      this.gameToRun.runType = runType;
    } else {
        if(this.auth.userInfoObject['balance'] === 0 && runType === 'real'){
          this.depositError = true;
        } else {
          game.runType = runType;
          this.subscriptionsService.setRunGameObj(game);
        }
    }
  }
  hideFilters(){
    this.showMobileFilters = false;
    this.subscriptionsService.setShowCasinoFilters(false);
    const element = this.document.getElementsByTagName('html');
    this.renderer.removeClass(document.body, 'noscroll');
    this.renderer.removeClass(element[0], 'noscroll');
    this.renderer.removeClass(document.body, 'casino-filters');
  }

  applyMobileFilters() {
    this.casino.getCasinoGames(true, true, this.casino.mobileFiterProvider, this.casino.mobileFilterCategory);
    this.subscriptionsService.setShowCasinoFilters(false);
    this.showMobileFilters = false;
    const element = this.document.getElementsByTagName('html');
    this.renderer.removeClass(element[0], 'noscroll');
    this.renderer.removeClass(document.body, 'noscroll');
    this.renderer.removeClass(document.body, 'casino-filters');
  }
  goToDepositPage(){
    this.router.navigate(['dashboard'], {queryParams: {'tab': 'deposit'}});
  }
}
