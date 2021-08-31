import {
  Component,
  ElementRef,
  EventEmitter,
  Inject,
  Input,
  OnInit,
  Output,
  Renderer2,
  ViewChild
} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { HttpService } from '../../../shared/services/http/http.service';
import { environment } from '../../../../environments/environment.prod';
import { WindowService } from '../../../shared/services/window/window.service';
import { Subscription } from 'rxjs';
import { SubscriptionsService } from '../../../shared/services/subscriptions/subscriptions.service';
import { AuthService } from '../../../shared/services/auth/auth.service';
import { Router } from '@angular/router';


@Component({
  selector: 'workspace-game-launcher',
  templateUrl: './game-launcher.component.html',
  styleUrls: ['./game-launcher.component.scss']
})
export class GameLauncherComponent implements OnInit {
  @ViewChild('iFrameWrap', { read: ElementRef, static: false })
  iFrameWrap: ElementRef;
  iframeWrapperWidth: number;
  aspectRatio: any;
  @Input() gameObj: any;
  @Output() closeGame: EventEmitter<any> = new EventEmitter();
  restGames: any = [];
  isFullScreen: boolean;
  fullscreenElem: any;
  gameUrl: any;
  canGameStart: boolean;
  resizeCheck: Subscription;
  depositError: boolean;
  constructor(private http: HttpService,
              @Inject(DOCUMENT) private document: any,
              private rs: WindowService,
              private subscriptionsService: SubscriptionsService,
              private renderer: Renderer2,
              private auth: AuthService,
              private router: Router) {
    this.resizeCheck = this.rs.onResize$.subscribe((data) => {
      this.calculateIframeWidthWrapper(this.iFrameWrap)
    });
  }

  ngOnInit(): void {
    this.fullscreenElem = document.documentElement;
    if (this.rs.getScreenSize() >= 992) {
      this.http.callRequest(`getGames?partner_id=${environment.settings.siteID}&offset=0&limit=5&category=${this.gameObj.categories[0]}`, 'POST', '', true)
        .subscribe(response => {
          this.restGames = [...response.games];
        })
    }

    this.prepareGameUrl(this.gameObj, this.gameObj.runType);
  }

  gameAction(what) {
    switch (what) {
      case 'close':
        this.closeGame.emit(true);
        this.renderer.removeClass(document.body, 'open-game');
        this.renderer.removeClass(document.body, 'noscroll');
        break;
      case 'new_tab':
        this.openNewTab();
        break;
      case 'enter_full_screen':
        this.openFullScreen();
        break;
      case 'close_full_screen':
        this.closeFullScreen();
        break;
    }
  }


  openNewTab(){
    const tab = window.open(this.gameUrl,'_blank');
    tab.focus();
    this.closeGame.emit(true);
    this.renderer.removeClass(document.body, 'open-game');
    this.renderer.removeClass(document.body, 'noscroll');
  }

  openFullScreen() {
    if (this.fullscreenElem.requestFullscreen) {
      this.fullscreenElem.requestFullscreen();
    } else if (this.fullscreenElem.mozRequestFullScreen) {
      this.fullscreenElem.mozRequestFullScreen();
    } else if (this.fullscreenElem.webkitRequestFullscreen) {
      this.fullscreenElem.webkitRequestFullscreen();
    } else if (this.fullscreenElem.msRequestFullscreen) {
      this.fullscreenElem.msRequestFullscreen();
    }
    this.isFullScreen = true;
  }

  closeFullScreen(){
    if (this.document.exitFullscreen) {
      this.document.exitFullscreen();
    } else if (this.document.mozCancelFullScreen) {
      this.document.mozCancelFullScreen();
    } else if (this.document.webkitExitFullscreen) {
      this.document.webkitExitFullscreen();
    } else if (this.document.msExitFullscreen) {
      this.document.msExitFullscreen();
    }
    this.isFullScreen = false;
  }

  checkAspectRatio(ratio){
    switch (ratio) {
      case '16:9':
        this.aspectRatio = 56.25;
        break;
      case '4:3':
        this.aspectRatio = 75;
        break;
      case '3:2':
        this.aspectRatio = 66.66;
        break;
      case '8:5':
        this.aspectRatio = 62.5;
        break;
      case '1:1':
        this.aspectRatio = 100;
        break;
    }
  }

  prepareGameUrl(gameData, gameType){
    this.canGameStart = false;
    this.gameUrl = '';
    if (this.rs.getScreenSize() <= 992) {
      this.renderer.addClass(document.body, 'open-game');
      this.renderer.addClass(document.body, 'noscroll');
    }
    let devicetypeid;
    let isMob;
    let gameLanguage;
    if (this.rs.getScreenSize() <= 992) {
      devicetypeid = 2;
      isMob = true;
    } else {
      devicetypeid = 1;
      isMob = false;
    }
     if(localStorage.getItem('pageLanguage') !== 'en' && gameData.provider === "JID" || gameData.provider === 'BMG' || gameData.provider === 'RLGn'){
       gameLanguage = 'zhh'
     } else {
       gameLanguage = localStorage.getItem('pageLanguage');
     }

    console.log(gameData)
    this.checkAspectRatio(gameData.ratio);

       this.gameUrl = `${environment.settings.gamesApi}/authorization.php?partnerId=${environment.settings.siteID}&${gameType  === 'real' ? `token=${JSON.parse(localStorage.getItem('100BetAuthData'))['auth_token']}&` : ''}gameId=${gameData.extearnal_game_id}&language=${gameLanguage}&openType=${gameType}&isMobile=${isMob}devicetypeid=${devicetypeid}&platformType=0&exitURL=${environment.settings.baseUrl}/casino`;

    this.canGameStart = true;
    setTimeout(() => {
      this.calculateIframeWidthWrapper(this.iFrameWrap)
    }, 100)
  }

  calculateIframeWidthWrapper(element){
    this.iframeWrapperWidth = element.nativeElement.offsetHeight / (this.aspectRatio/100);
  }

  runGame(game, runType) {
    if (this.auth.userInfoObject['balance'] === 0 && runType === 'real') {
      this.depositError = true;
    } else {
      game.runType = runType;
      this.subscriptionsService.setRunGameObj(game);

      this.prepareGameUrl(game, runType);
    }
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
    localStorage.setItem('100BetCasino', JSON.stringify(casinoObj));
  }
  goToDepositPage(){
    this.router.navigate(['dashboard'], {queryParams: {'tab': 'deposit'}});
  }
} 
