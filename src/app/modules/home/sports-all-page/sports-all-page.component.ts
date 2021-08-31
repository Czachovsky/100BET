import { ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import {SubscriptionsService} from "../../../shared/services/subscriptions/subscriptions.service";
import { WebsocketService } from "../../../shared/services/websocket/websocket.service";
import * as _ from "lodash";
import { MARKET_TYPE_HEADER } from '../../../shared/enums/market-type-headers';
import { JsonService } from "../../../shared/services/json/json.service";
import { UtilityService } from "../../../shared/services/utility.service";
import { TranslateService } from "@ngx-translate/core";
import { GAME_STATES } from "../../../shared/game-states";
import { Subject, Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { BetSlipService } from '../../../shared/services/bet-slip/bet-slip.service';
import { GameInfo } from '../../../components/markets/markets.component';
import { KeyValue } from '@angular/common';
import { takeUntil } from 'rxjs/operators';
import { AuthService } from '../../../shared/services/auth/auth.service';
import { FormatBasePipe } from '../../../shared/pipes/format-base.pipe';
import { WindowService } from '../../../shared/services/window/window.service';
import { HttpService } from '../../../shared/services/http/http.service';
import { OddsService } from '../../../shared/services/odds/odds.service';

@Component({
  selector: 'workspace-sports-all-page',
  templateUrl: './sports-all-page.component.html',
  styleUrls: ['./sports-all-page.component.scss']
})
export class SportsAllPageComponent implements OnInit, OnDestroy {

  liveEventVisibility: Subscription;
  leftMenuVisibility: Subscription;
  leftMenuVisible: boolean;
  isEventView: boolean;
  gameInfo: GameInfo;
  defaultOption:any;
  selectOptions: any;
  actualTableHeader: any = [];
  competitions: any = [];
  icons: any = [];
  sportsCategories: any;
  kindaSport: any;
  categoryObject: any;
  sportObject: any;
  kindaSportObj: any;
  kindaMarket: any;
  @ViewChild('scrollEl') scrollEl: ElementRef;
  @ViewChildren('time') timeDivs: QueryList<ElementRef>;
  picksInBetslip: any = [];
  menuSubid: any;
  tempMenuObj: any;
  bodySubid: any;
  tempBodyObj: any;
  bodyObj: any;
  freshLoad: boolean;
  language: string;
  seconds;
  destroy$: Subject<boolean> = new Subject<boolean>();
  betSlipCartChanged: Subscription;
  languageChange: Subscription;
  firstLoad = true;
  objectKeys = Object.keys;
  userLogged: boolean;
  isLogged: Subscription;
  elementWidth;
  liveInterval;
  isMobile = false;
  liveStreamIds: Array<number> = [];
  private visibilityChangeCallback: () => void;
  visibilityChnage: boolean;

  constructor(private subscriptionsService: SubscriptionsService,private betSlipService: BetSlipService,
              private websocket: WebsocketService, public utility: UtilityService,
              private windowService: WindowService, private httpSer: HttpService,
              private jsonService: JsonService, private router: Router, private route: ActivatedRoute,
              public translate: TranslateService,public cdRef:ChangeDetectorRef,
              private auth: AuthService,private formatBase: FormatBasePipe,
              public os: OddsService) {
    this.isLogged = this.subscriptionsService.getIsLoggedIn().subscribe((data)=>{
      this.userLogged = data;
    })
    this.picksInBetslip = [...this.betSlipService.getArrayOfPicks()];
    if (router.url.indexOf('/event-view') !== -1) {
      route.params.subscribe(params => {
        if (params.alias && params.gameId && params.sportId) {
          this.gameInfo = {
            alias: params.alias,
            sportId: Number(params.sportId),
            gameId: Number(params.gameId)
          };
          this.isEventView = true;
        }
      });
    }
    this.betSlipCartChanged = this.subscriptionsService
      .getBetSlipChanges()
      .subscribe((data) => {
        if (data) {
          this.picksInBetslip = [...this.betSlipService.getArrayOfPicks()];
        }
      });
    this.language = localStorage.getItem('pageLanguage');
    this.jsonService.getJson(`sports-icons`).subscribe(data => {
      this.icons = data;
    });

    this.windowService.onResize$.pipe(takeUntil(this.destroy$)).subscribe((data) => {
      if (data.width <= 992) {
        this.isMobile = true;
      } else {
        this.isMobile = false;
      }
    });
    if (this.windowService.getScreenSize() <= 992) {
      this.isMobile = true;
    }
    this.languageChange = this.subscriptionsService.getLanguage().subscribe(lang => {
      if(lang){
        this.getData();
      }
    });
  }

  ngOnInit(): void {
    this.userLogged = this.auth.isLoggedIn;
    this.seconds = this.utility.getSeconds();
    setInterval(() => {
      this.seconds = this.utility.getSeconds();
    }, 1000);
    this.getData();

    this.visibilityChangeCallback = () => this.handleVisibleState();
    document.addEventListener('visibilitychange', this.visibilityChangeCallback, true);
  }

  handleVisibleState() {
    if (document.visibilityState && !this.isEventView) {
      if (this.visibilityChnage) {
        this.visibilityChnage = false;
        if (this.bodySubid) {
          this.websocket.sendMessage({
            command: 'unsubscribe',
            params: {
              subid: this.bodySubid,
            }
          });
        }
        if (this.menuSubid) {
          this.websocket.sendMessage({
            command: 'unsubscribe',
            params: {
              subid: this.menuSubid,
            }
          });
        }
        this.getData();
      } else {
        this.visibilityChnage = true;
      }
    }
  }

  getData() {
    this.freshLoad = true;
    this.kindaMarket = 'MatchWinner3';
    this.websocket.getData().subscribe(data => {
      if(data.rid === 'OHB-inPlayPageMenu' && this.freshLoad){
        this.tempMenuObj = Object.assign({}, data.data.data.sport)
        this.menuSubid = data.data.subid;
        this.sportsCategories = [..._.sortBy([..._.values(_.cloneDeep(data.data.data.sport)).filter(x => x.order > 500)], o => o.order)];
        this.cdRef.detectChanges();
        if (this.route.snapshot.queryParams && this.route.snapshot.queryParams.sport) {
          const idx = this.sportsCategories.findIndex(x => this.route.snapshot.queryParams.sport === this.formatAlias(x.alias));
          if (idx !== -1) {
            this.changeCategory(this.sportsCategories[idx]);
          }
        } else {
          const sport = this.kindaSport ? this.kindaSport : this.sportsCategories[0];
          this.changeCategory(sport);
        }
        this.freshLoad = false;
      }
      if(data.rid === 'OHB-in-play-page') {
        if (data.data && data.data.data.sport[this.kindaSport.id]) {
          this.bodySubid = data.data.subid;
          this.tempBodyObj = JSON.parse(JSON.stringify(data.data.data.sport[this.kindaSport.id].region));
          this.bodyObj = Object.assign({}, this.tempBodyObj);
          this.modifyInplayData();
          setTimeout(() => {
            this.getStreamInfo();
            if (this.liveInterval) {
              clearInterval(this.liveInterval);
            }
            this.liveInterval = setInterval(() => {
              this.getStreamInfo();
            }, 60 * 1000);
          }, 100);
          this.freshLoad = false;
        }
      }
      if (data.data !== null && data.data[this.bodySubid] && data.data[this.bodySubid].sport[this.kindaSport.id] &&
         data.data[this.bodySubid].sport && !this.freshLoad) {
        this.tempBodyObj = Object.assign({}, _.mergeWith(
          {},
          this.tempBodyObj,
          data.data[this.bodySubid].sport[this.kindaSport.id].region));
        const bodyObj = Object.assign({}, this.tempBodyObj);
        this.bodyObj = this.clean(bodyObj);
        this.modifyInplayData(true);
      }
      if (data.data !== null && data.data[this.menuSubid]) {
        this.tempMenuObj = Object.assign({}, _.mergeWith(
          {},
          this.tempMenuObj,
          data.data[this.menuSubid].sport,
          (a,b)=>b === null ? a : undefined));
        this.sportsCategories = [..._.sortBy([..._.values(_.cloneDeep(this.tempMenuObj)).filter(x => x.order > 500)], o => o.order)];
        this.cdRef.detectChanges();
        this.modifyCategoriesArray(this.sportsCategories, this.kindaSport);
      }
    });

    this.websocket.sendMessage({
      "command":"get",
      "params":{
        "source":"betting",
        "what":{
          "sport":[
            "id","name","alias","order"
          ]},
          "where":{
            sport: {
              type: {
                '@nin': [1, 4],
              },
            },
            "game":{
              "type":1
            },
            "market": {
              "type": {
              }
            }
          },"subscribe":true},
      "rid":"OHB-inPlayPageMenu"})
  }

  adjustWidth() {
    if (window.innerWidth > 767) {
      this.utility.adjustWidth(this.timeDivs);
    }
  }

  getStreamInfo() {
    const bcEventIDs = this.competitions.reduce((r, {game}) => {
      game.forEach(e => r.push(e.id.toString()));
      return r;
    }, []);
    this.httpSer.callRequest('ksport/getstreamstatesome', 'POST', {bcEventIDs}).subscribe(res => {
      if (res.result) {
        Object.keys(res.data).forEach(key => {
          if (res.data[key].streamState) {
            if (!this.liveStreamIds.includes(Number(key))) {
              this.liveStreamIds.push(Number(key));
            }
          } else if (this.liveStreamIds.includes(Number(key)) && !res.data[key].streamState) {
            const idx = this.liveStreamIds.findIndex(x => x === Number(key));
            if (idx !== -1) {
              this.liveStreamIds.splice(idx, 1);
            }
          }
        });
      }
    });
  }

  getCurrentTime(info) {
    if (!info.match_time) {
      info.match_time = info.current_game_time;
      info.match_time = info.match_time.split(':')[0];
    }
    if (this.seconds === '00' && !info.timeUpdated) {
      info.timeUpdated = true;
      info.match_time = parseInt(info.match_time, 0) + 1;
    }
    if (info.timeUpdated && this.seconds === '01') {
      info.timeUpdated = false;
    }
    return info.match_time;
  }

  modifyInplayData(isUpdatedData?: boolean) {
    const regions = _.cloneDeep(_.values(this.bodyObj));
    let competitions = [];
    for(const region of regions) {
      for (const key in region.competition) {
        if (region.competition.hasOwnProperty(key)) {
          region.competition[key]['region'] = {
            id: region.id,
            name: region.name,
            order: region.order,
            alias: region.alias
          };
          region.competition[key].game = _.values(region.competition[key].game);
          const promoted = region.competition[key].game.filter(x => x && x.promoted).sort((a, b) => {
            return <any>new Date(a.start_ts * 1000) - <any>new Date(b.start_ts * 1000);
          });
          const notPromoted = region.competition[key].game.filter(x => x && !x.promoted).sort((a, b) => {
            return <any>new Date(a.start_ts * 1000) - <any>new Date(b.start_ts * 1000);
          });
          region.competition[key].game = [...promoted, ...notPromoted];
        }
      }
      competitions = [...competitions, ..._.values(region.competition)];
    }
    const favorites = competitions.filter(x => x.favorite).sort((a, b) => {
      return a.order - b.order;
    });
    const notfavorites = competitions.filter(x => !x.favorite).sort((a, b) => {
      return a.order - b.order;
    });
    const oldComp = _.cloneDeep(this.competitions);
    this.competitions = [...favorites, ...notfavorites];
    if (this.kindaSport.id === 1 && isUpdatedData) {
      this.checkForGoal(oldComp);
    }
    if ((this.firstLoad && !this.gameInfo)) {
      this.firstLoad = false;
      this.gameInfo = {
        gameId: this.competitions[0].game[0].id,
        sportId: this.kindaSport.id,
        alias: this.kindaSport.alias
      };
    }
    this.adjustWidth();
  }

  checkForGoal(oldCompetitions) {
    oldCompetitions.forEach(oldData => {
      const idx = this.competitions.findIndex(x => x.id === oldData.id);
      if (idx !== -1 && oldData.game) {
        oldData.game.forEach(game => {
          const gameIdx = this.competitions[idx].game.findIndex(x => x.id === game.id);
          if (gameIdx !== -1) {
            if (Number(this.competitions[idx].game[gameIdx].info.score1) > Number(game.info.score1)) {
              this.competitions[idx].game[gameIdx].team1_goal = true;
              setTimeout(() => {
                this.competitions[idx].game[gameIdx].team1_goal = false;
              }, 1000);
            }
            if (Number(this.competitions[idx].game[gameIdx].info.score2) > Number(game.info.score2)) {
              this.competitions[idx].game[gameIdx].team2_goal = true;
              setTimeout(() => {
                this.competitions[idx].game[gameIdx].team2_goal = false;
              }, 1000);
            }
          }
        });
      }
    });
  }

  orderAsc = (akv: KeyValue<string, any>, bkv: KeyValue<string, any>): number => {
    const a = akv.value.order;
    const b = bkv.value.order;
    return a > b ? 1 : (b > a ? -1 : 0);
  };

  getGameIcon(element): string {
    const idx = this.icons.findIndex(x => x.alias === element.alias);
    return idx !== -1 ? this.icons[idx]['icon'] : 'assets/images/icons/sports/soccer.png';
  }

  selectMarket(e) {
    this.kindaMarket = e.optionName;
    this.actualTableHeader = MARKET_TYPE_HEADER[e.optionValue];
    this.getInPlayData(e);
  }

  getInPlayData(e){
    this.freshLoad = true;
    const marketType = [e.optionName];
    this.websocket.sendMessage({
      "command":"get",
      "params": {
        "source":"betting",
        "what": {
          "sport": ["id","name","alias","order"],
          "region":[],
          "competition":[],
          "game": [
            [
              "id","start_ts","team1_name","team2_name","type","info",'promoted',"events_count","events",
              "markets_count","is_started","is_blocked","stats","tv_type","video_id","video_id2","video_id3","partner_video_id",
              "is_stat_available","game_number","game_info"
            ]
          ],
          "market":[],
          "event":["name","id","price","type","order","base"]
        },
        "where":{
          "sport":{
            type: {
              '@nin': [1, 4],
            },
            "id":this.kindaSport.id
          },
          "game": {
            "type": 1
          },
          "market":{
            "@node_limit": 1,
            "market_type": {
              "@in": marketType
            }
          }
        },"subscribe":true
      }, "rid":"OHB-in-play-page"})
  }

  modifyCategoriesArray(array, activeSport) {
    this.categoryObject = array;
    this.categoryObject.map(e => {
      e.name === activeSport.name ? e.selected = true : e.selected = false
    });
  }

  setDropDownList(sport) {
    this.jsonService.getJson(`market-types`).pipe(takeUntil(this.destroy$)).subscribe((data) => {
      const dropDownListBySport = data['types'];
      const idx = dropDownListBySport.findIndex(x => x.id === sport.id);
      if (idx !== -1) {
        this.selectOptions = dropDownListBySport[idx].marketTypes.options;
        const defOption = dropDownListBySport[idx].marketTypes.default;
        this.defaultOption = defOption ? defOption : this.selectOptions[0];
        this.selectMarket(this.defaultOption);
      } else {
        this.selectOptions = [];
        this.defaultOption = {};
        this.selectMarket({optionValue: 'MatchResult', optionName: 'MatchWinner3'});
      }
    });
  }

  changeCategory(cat, isClicked?: boolean) {
    this.utility.resetWidth(this.timeDivs);
    this.kindaSport = cat;
    if (isClicked) {
      this.firstLoad = true;
      this.gameInfo = undefined;
    }
    this.competitions = []
    this.modifyCategoriesArray(this.sportsCategories, this.kindaSport);
    this.setDropDownList(cat);
  }

  redirectTo(eventView: boolean) {
    this.isEventView = eventView;
    this.gameInfo = undefined;
    if (!eventView) {
      this.router.navigate([`/sportsbook/in-play`]);
    }
  }


  addBetToCart(pick, featured, market) {
    if (this.picksInBetslip.includes(pick.value['id'])) {
      this.betSlipService.removePickFromBetSlip(pick.value['id']);
    } else {
      this.betSlipService.addPickToBetSlip({
        event_ts: featured.start_ts,
        competitionId: featured.competitionID,
        competitionName: featured.competition,
        eventId: pick.value['id'],
        eventType: pick.value['type'],
        expressId: market.value['express_id'],
        gameId: featured['id'],
        marketId: market.value['id'],
        marketName: market.value['name'],
        marketType: market.value['market_type'],
        price: pick.value['price'],
        team1Name: featured.team1_name,
        team2Name: featured.team2_name,
        selectedOption: pick.value['name'],
        isLive: featured.is_live,
        isStarted: featured.is_started,
        isBlocked: featured.is_blocked,
        possibleWin: pick.value['price'],
        stake: '',
        selected: true,
        isConflict: false,
        isBanker: false,
        pickType: 'single',
        base: pick.value['base'],
        isAsian: this.isAsian(market.value['market_type']),
        asianBase: this.isAsian(market.value['market_type']) ? this.formatBase.transform(pick.value['base']) : false,
      });
    }
    this.picksInBetslip = [...this.betSlipService.getArrayOfPicks()];
  }
  isAsian(str): boolean {
    return str.toLowerCase().indexOf('asian') !== -1;
  }
  shouldHasPickedClass(id) {
    return this.picksInBetslip.includes(id);
  }

  showNavigationLeft() {
    if (this.scrollEl) {
      const hasHorizontalScrollbar = this.scrollEl.nativeElement.scrollLeft && this.scrollEl.nativeElement.scrollWidth > this.scrollEl.nativeElement.clientWidth;
      return hasHorizontalScrollbar;
    }
    return 0;
  }

  showNavigationRight() {
    if (this.scrollEl) {
      const maxScrollLeft = this.scrollEl.nativeElement.scrollWidth - this.scrollEl.nativeElement.clientWidth;
      const hasHorizontalScrollbar = maxScrollLeft !== Math.floor(this.scrollEl.nativeElement.scrollLeft) && this.scrollEl.nativeElement.scrollWidth > this.scrollEl.nativeElement.clientWidth;
      return hasHorizontalScrollbar;
    }
    return false;
  }

  scrollLeft() {
    this.scrollEl.nativeElement.scrollLeft -= 500;
  }

  scrollRight() {
    this.scrollEl.nativeElement.scrollLeft += 500;
  }

  formatAlias(alias): string {
    const a = alias.split(/(?=[A-Z])/).join('-').toLowerCase();
    return alias ? a.toLowerCase() : '';
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
    if (this.liveInterval) {
      clearInterval(this.liveInterval);
    }
    document.removeEventListener('visibilitychange', this.visibilityChangeCallback, true);
  }
  trackByFn(index, item ) {
    return( item.id );
  }

  replaceNull(someObj, replaceValue = {}){
    const replacer = (key, value) =>
      String(value) === "null" || String(value) === "undefined" ? replaceValue : value;

    return JSON.parse( JSON.stringify(someObj, replacer));
  }

  watchLive(game) {
    localStorage.setItem('liveStreamUrl', game.id.toString());
    this.utility.selectGameForLiveStream(game);
  }

  showAnimation(game) {
    this.utility.selectGameForAnimation(game);
  }

  goToInPlay(game) {
    this.isEventView = true;
    if (game && this.kindaSport) {
      this.router.navigate([`/sportsbook/in-play/event-view/${this.kindaSport.alias}/${this.kindaSport.id}/${game.id}`]);
    }
  }

  clean(obj) {
    for (const propName in obj) {
      if (obj[propName] === null || obj[propName] === undefined) {
        delete obj[propName];
      } else if (typeof obj[propName] === "object" && !Array.isArray(obj[propName])) {
        this.clean(obj[propName])
      }
    }
    return obj;
  }

}
