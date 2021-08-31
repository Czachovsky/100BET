import { ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { WebsocketService } from '../../shared/services/websocket/websocket.service';
import * as _ from 'lodash';
import { AnimationsService } from '../../shared/services/animations/animations.service';
import { UtilityService } from '../../shared/services/utility.service';
import { Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { GAME_STATES } from '../../shared/game-states';
import { SubscriptionsService } from '../../shared/services/subscriptions/subscriptions.service';
import { Router } from '@angular/router';
import { BetSlipService } from '../../shared/services/bet-slip/bet-slip.service';
import { KeyValue } from '@angular/common';
import { FormatBasePipe } from '../../shared/pipes/format-base.pipe';
import { WindowService } from '../../shared/services/window/window.service';
import { JsonService } from '../../shared/services/json/json.service';
import { OddsService } from '../../shared/services/odds/odds.service';
import { PerfectScrollbarComponent } from 'ngx-perfect-scrollbar';

export interface GameInfo {
  gameId: number;
  sportId: number;
  alias: string;
}

@Component({
  selector: 'workspace-markets',
  templateUrl: './markets.component.html',
  styleUrls: ['./markets.component.scss']
})
export class MarketsComponent implements OnInit, OnChanges, OnDestroy {
  @Input() gameInfo: GameInfo;
  @Input() perfectScroll: PerfectScrollbarComponent;
  @Output() navigateOverview: EventEmitter<boolean> = new EventEmitter<boolean>();
  tempBodyObj: any;
  eventDetails;
  subId;
  selectedCategory = 'All';
  eventCategories = [];
  activeMarkets = [];
  picksInBetslip: any = [];
  correctScoreArr: any = ['home', 'draw', 'away'];
  language: string;
  betSlipCartChanged: Subscription;
  languageChange: Subscription;
  destroy$: Subject<boolean> = new Subject<boolean>();
  isMarketView;
  isEventView;
  firstLoad = true;
  isMobile = false;
  sports: any = [];
  @ViewChild('scrollEl') scrollEl: ElementRef;

  constructor(private websocket: WebsocketService,
    public utility: UtilityService,
    private router: Router,
    public jsonService: JsonService,
    public cdRef:ChangeDetectorRef,
    private windowService: WindowService,
    private betSlipService: BetSlipService,
    public subscriptionService: SubscriptionsService,
    private animationService: AnimationsService,
    private formatBase: FormatBasePipe,
              public os:  OddsService) {
    this.language = localStorage.getItem('pageLanguage');
    this.isEventView = router.url.indexOf('/sportsbook/in-play/event-view') !== -1;
    this.isMarketView = this.isEventView ? false : router.url.indexOf('/sportsbook/markets/') !== -1;
    this.picksInBetslip = [...this.betSlipService.getArrayOfPicks()];
    this.betSlipCartChanged = this.subscriptionService
      .getBetSlipChanges()
      .subscribe((data) => {
        if (data) {
          this.picksInBetslip = [...this.betSlipService.getArrayOfPicks()];
        }
      });

      this.windowService.onResize$.pipe(takeUntil(this.destroy$)).subscribe((data) => {
        if (data.width <= 992) {
          this.isMobile = true;
        } else {
          this.isMobile = false;
        }
      });

      this.jsonService.getJson(`sports-icons`).subscribe(data => {
        this.sports = data;
      });

    this.languageChange = this.subscriptionService.getLanguage().subscribe(lang => {
      if(lang){
        this.getData();
      }
    });
    if (this.windowService.getScreenSize() <= 992) {
      this.isMobile = true;
    }
  }

  ngOnInit(): void {
    this.getData();
  }

  getData() {
    this.sendMessage();
    this.websocket.getData().pipe(takeUntil(this.destroy$)).subscribe((data) => {
      if (data.data && data.data !== 'null' && data.data !== 'undefined' && typeof data.data === 'object') {
        if (data.rid === 'OHB-in-play-markets' && data.data && data.data.data.sport && data.data.data.sport[this.gameInfo.sportId]) {
          this.subId = data.data.subid;
          this.tempBodyObj = JSON.parse(JSON.stringify(data.data.data.sport[this.gameInfo.sportId]));
          this.modifyInplayData();
          this.selectedCategory = 'All';
        }
      }
      if (data.data !== null && data.data[this.subId]) {
        const tempBodyObj = Object.assign({}, _.mergeWith(
          {},
          this.tempBodyObj,
          data.data[this.subId].sport[this.gameInfo.sportId]));
        this.tempBodyObj =  this.clean(tempBodyObj);
        this.modifyInplayData();
      }
    });
  }

  modifyInplayData() {
    let positionY: any = 0;
    if (this.perfectScroll) {
      positionY = this.perfectScroll.directiveRef.position(true).y;
    }
    const sport = _.cloneDeep(this.tempBodyObj);
    if (sport && sport.region) {
      const region = _.values(sport.region)[0];
      const competition = _.values(region.competition)[0];
      const game = competition.game[this.gameInfo.gameId];
      this.eventDetails = { sport, region, competition, game };
      if (game && game.markets_count > 0) {
        const markets = _.values(game.market).map(item => {
          item.name = item.name.replace('Team 1', game.team1_name);
          item.name = item.name.replace('Team 2', game.team2_name);
          return item;
        });
        delete sport.region;
        delete region.competition;
        delete competition.game;
        this.eventDetails.markets = _.sortBy(markets,
          [(o) => {
            return o.group_order;
        }]);
        this.eventCategories = ['All', ...new Set(this.eventDetails.markets.map(item => item.group_name))];
        this.cdRef.detectChanges();
        this.eventDetails.markets = _.mapValues(_.groupBy(this.eventDetails.markets, 'group_name'), v => _.sortBy(v, 'order'));
        for (const key in this.eventDetails.markets) {
          if (this.eventDetails.markets.hasOwnProperty(key)) {
            this.eventDetails.markets[key].forEach(element => {
              element.event = _.sortBy(_.values(element.event),
                [(o) => {
                  return o.order;
              }]);
              element.event.forEach(e => {
                e.name = e.name.replace('Team 1', game.team1_name);
                e.name = e.name.replace('Team 2', game.team2_name);
                e.name = e.name.replace('W1', game.team1_name);
                e.name = e.name.replace('W2', game.team2_name);
              });
            });
            const groupByList = _.mapValues(_.groupBy(this.eventDetails.markets[key], 'name'), v => _.sortBy(v, 'order'));
            this.eventDetails.markets[key] = groupByList;
            const all = this.eventDetails.markets['All'];
            this.eventDetails.markets['All'] = Object.assign(all ? all : {}, groupByList);
          }
        }
        if (this.perfectScroll) {
          this.perfectScroll.directiveRef.update(); //for update scroll
          this.perfectScroll.directiveRef.scrollToTop(Math.round(Number(positionY)), 1);
        }
        if (this.firstLoad) {
          this.firstLoad = false;
          this.selectMarketType(this.selectedCategory);
        }
      }
    }
  }

  selectMarketType(type) {
    this.selectedCategory = type;
    this.activeMarkets = [];
    let i = 0;
    const max = this.isMarketView ? 5 : Object.keys(this.eventDetails.markets[this.selectedCategory]).length;
    for (const eachMarket in this.eventDetails.markets[this.selectedCategory]) {
      if (Object(this.eventDetails.markets[this.selectedCategory]).hasOwnProperty(eachMarket)) {
        if (i < max) {
          this.activeMarkets.push(eachMarket);
          i++;
        }
      }
    }
  }

  expandIt(e, event){
    this.animationService.slideToggle(e);
    if (event && event.key) {
      if (this.activeMarkets.includes(event.key)) {
        const idx = this.activeMarkets.findIndex(x => x === event.key);
        if (idx !== -1) {
          this.activeMarkets.splice(idx, 1);
        }
      } else {
        this.activeMarkets.push(event.key);
      }
    }
  }

  checkForActive(name): boolean {
    return this.activeMarkets.includes(name);
  }

  redirect() {
    if (this.isMarketView) {
      this.router.navigate(['/']);
    } else {
      this.navigateOverview.emit(true);
    }
  }

  getCorrectScore(event, type) {
    if (event) {
      let arr = [];
      let away = [];
      let draw = [];
      for (const e of event) {
        const name = e.name.trim();
        if (Number(name.split('-')[0]) > Number(name.split('-')[1])) {
          arr.push(e);
        }
        if (Number(name.split('-')[1]) > Number(name.split('-')[0])) {
          away.push(e);
        }
        if (Number(name.split('-')[1]) === Number(name.split('-')[0])) {
          draw.push(e);
        }
      }
      let arrLen = 0;
      if (arr.length > away.length && arr.length > draw.length) {
        arrLen = arr.length;
      } else if (away.length > arr.length && away.length > draw.length) {
        arrLen = away.length;
      } else if (draw.length > arr.length && draw.length > away.length) {
        arrLen = draw.length;
      }
      if (arr.length > away.length && arr.length > draw.length) {
        away = [...away, ...new Array(arrLen - away.length)];
        draw = [...draw, ...new Array(arrLen - draw.length)];
      }
      if (away.length > arr.length && away.length > draw.length) {
        arr = [...arr, ...new Array(arrLen - arr.length)];
        draw = [...draw, ...new Array(arrLen - draw.length)];
      }
      if (draw.length > arr.length && draw.length > away.length) {
        away = [...away, ...new Array(arrLen - away.length)];
        arr = [...arr, ...new Array(arrLen - arr.length)];
      }
      return type === 'home' ? arr : type === 'away' ? away : draw;
    } else {
      return [];
    }
  }

  addBetToCart(pick, featured, market) {
    if (!pick) {
      return;
    }
    pick = { key: pick.id.toString(), value: pick };
    if (this.picksInBetslip.includes(pick.value['id'])) {
      this.betSlipService.removePickFromBetSlip(pick.value['id']);
    } else {
      this.betSlipService.addPickToBetSlip({
        event_ts: featured.start_ts,
        competitionId: featured.competitionID,
        competitionName: featured.competition,
        eventId: pick.value['id'],
        eventType: pick.value['type'],
        expressId: market.value[0]['express_id'],
        gameId: featured['id'],
        marketId: market.value[0]['id'],
        marketName: market.value[0]['name'],
        marketType: market.value[0]['market_type'],
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
        isAsian: this.isAsian(market.value[0]['market_type']),
        asianBase: this.isAsian(market.value[0]['market_type']) ? this.formatBase.transform(pick.value['base']) : false,
      });
    }
    this.picksInBetslip = [...this.betSlipService.getArrayOfPicks()];
  }

  shouldHasPickedClass(id) {
    return this.picksInBetslip.includes(id);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes && changes.gameInfo && changes.gameInfo.currentValue) {
      this.gameInfo = changes.gameInfo.currentValue;
      this.sendMessage();
    }
  }

  getFieldImage() {
    const idx = this.sports.findIndex(x => x.alias === this.gameInfo.alias);
    return idx !== -1 && this.sports[idx]['fieldImg'] ? this.sports[idx]['fieldImg'] : 'assets/images/fields/Desktop-generic.png';
  }

  getFieldImageMobile() {
    const idx = this.sports.findIndex(x => x.alias === this.gameInfo.alias);
    return idx !== -1 && this.sports[idx]['mobileField'] ? this.sports[idx]['mobileField'] : 'assets/images/fields/mobile/Mask Group 64@3x.png';
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  getCurrentTime(time) {
    // console.log(time);
    time = time.split(':')[0];
    return this.utility.handleSingleDigit(time);
  }

  sendMessage() {
    if (this.subId) {
      this.websocket.sendMessage({
        "command": "unsubscribe",
        "params": {
          "subid": this.subId
        }
      });
      this.firstLoad = true;
      this.eventDetails = undefined;
    }
    if (this.gameInfo && this.gameInfo.gameId) {
      this.websocket.sendMessage({
        "command": "get",
        "params": {
          "source": "betting",
          "what": {
            "sport": ["id", "name", "alias"],
            "region": ["id", "alias", "name"],
            "competition": ["id", "name"],
            "game": ["id", "markets_count", "start_ts", "is_started", "is_blocked", "team1_id", "team2_id", "game_number", "text_info", "is_stat_available", "match_length", "type", "info", "stats", "team1_name", "team2_name", "tv_info", "add_info_name", "showInfo", "live_events", "last_event", "add_info"],
            "market": [],
            "event": ["id", "order", "type_1", "name", "price", "base"]
          },
          "where": {
            "game": {
              "id": this.gameInfo.gameId
            },
            "sport": {
              type: {
                '@nin': [1, 4],
              },
              "alias": this.gameInfo.alias
            }
          },
          "subscribe": true
        },
        "rid": "OHB-in-play-markets"
      });
    }

  }

  isAsian(str): boolean {
    return str.toLowerCase().indexOf('asian') !== -1;
  }

  getGameState(game){
    const state = game.info.current_game_state;
    if (GAME_STATES[state]) {
      if(state !== '' && state !== 'Half Time' && this.eventDetails.sport && (GAME_STATES[state].hasOwnProperty(this.eventDetails.sport['id']))){
        return GAME_STATES[state][this.eventDetails.sport['id']][this.language]
      } else {
        if(state === 'Half Time'){
          return 'Half Time';
        } else {
          return this.getTime(state);
        }
      }
    } else if(state === 'Half Time'){
      return 'Half Time';
    } else {
      return this.getTime(state);
    }
  }

  getTime(set) {
    const num = set.substr(set.length - 1);
    const preStr = this.utility.ordinal(Number(num));
    const postStr = set.slice(0, -1);
    return preStr + ' ' + postStr.charAt(0).toUpperCase() + postStr.slice(1);
  }

  getWidth(count) {
    return '1 0 ' + 100/count + '%';
  }

  getColor(color, type) {
    if (color && color !== '000000') {
      return '#' + color;
    } else {
      return type === 'team1' ? '#e23535' : '#cccccc';
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

  originalOrder = (a: KeyValue<number,string>, b: KeyValue<number,string>): number => {
    return 0;
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

}
