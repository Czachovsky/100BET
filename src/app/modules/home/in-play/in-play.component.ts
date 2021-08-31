import { Component, ElementRef, HostListener, OnDestroy, OnInit, QueryList, ViewChildren } from '@angular/core';
import { JsonService } from '../../../shared/services/json/json.service';
import { SubscriptionsService } from '../../../shared/services/subscriptions/subscriptions.service';
import { BetSlipService } from '../../../shared/services/bet-slip/bet-slip.service';
import { Subject, Subscription } from 'rxjs';
import { WebsocketService } from '../../../shared/services/websocket/websocket.service';
import { SportsId } from '../../../shared/enums/sports-id.enum';
import * as _ from 'lodash';
import { GAME_STATES } from '../../../shared/game-states';
import { Router } from '@angular/router';
import { UtilityService } from '../../../shared/services/utility.service';
import { HttpService } from '../../../shared/services/http/http.service';
import * as moment from 'moment';
import { takeUntil } from 'rxjs/operators';
import { MARKET_TYPE_HEADER } from '../../../shared/enums/market-type-headers';
import { KeyValue } from '@angular/common';
import { FormatBasePipe } from '../../../shared/pipes/format-base.pipe';
import { OddsService } from '../../../shared/services/odds/odds.service';

@Component({
  selector: 'workspace-in-play',
  templateUrl: './in-play.component.html',
  styleUrls: ['./in-play.component.scss'],
})
export class InPlayComponent implements OnInit, OnDestroy {
  activeEl: string;
  activeSportId: number;
  inPlayTable: any;
  inPlayNewTable: any = [];
  oldInPlayNewTable: any = [];
  tempObj: object = {};
  menuSubId: any;
  assignment = 0;
  menuElements: any = [];
  betSlipCartChanged: Subscription;
  actualTimeStamp: any;
  subIds: any = [];
  tempMenuEl: any;
  bodySubId: any;
  picksInBetslip: any = [];
  actualTableHeader: any = [];
  seconds;
  totalEvents = 0;
  language: string;
  languageChange: Subscription;
  destroy$: Subject<boolean> = new Subject<boolean>();
  marketType;
  liveInterval;
  objectKeys = Object.keys;
  @ViewChildren('time') timeDivs: QueryList<ElementRef>;
  innerWidth;
  liveStreamIds: Array<number> = [];
  private visibilityChangeCallback: () => void;
  visibilityChnage: boolean;
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.innerWidth = window.innerWidth;
  }

  constructor(
    private jsonService: JsonService, public utility: UtilityService,
    public subscriptionsService: SubscriptionsService,
    private betSlipService: BetSlipService,
    private websocketService: WebsocketService,
    private router: Router, private httpSer: HttpService,
    private formatBase: FormatBasePipe,
    public os: OddsService
  ) {
    this.picksInBetslip = [...this.betSlipService.getArrayOfPicks()];
    this.betSlipCartChanged = this.subscriptionsService
      .getBetSlipChanges()
      .subscribe((data) => {
        if (data) {
          this.picksInBetslip = [...this.betSlipService.getArrayOfPicks()];
        }
      });
    this.language = localStorage.getItem('pageLanguage');
    this.languageChange = this.subscriptionsService.getLanguage().subscribe(lang => {
      if (lang) {
        this.getData();
      }
    });
  }

  ngOnInit(): void {
    this.innerWidth = window.innerWidth;
    this.seconds = this.utility.getSeconds();
    this.activeEl = 'Soccer';
    this.activeSportId = 1;
    this.getData();

    this.visibilityChangeCallback = () => this.handleVisibleState();
    document.addEventListener('visibilitychange', this.visibilityChangeCallback, true);
  }

  handleVisibleState() {
    if (document.visibilityState) {
      if (this.visibilityChnage) {
        this.visibilityChnage = false;
        if (this.bodySubId) {
          this.websocketService.sendMessage({
            command: 'unsubscribe',
            params: {
              subid: this.bodySubId,
            }
          });
        }
        this.getBodyData();
      } else {
        this.visibilityChnage = true;
      }
    }
  }

  getStreamInfo() {
    const bcEventIDs = this.inPlayNewTable.map(x => x.id.toString());
    this.httpSer.callRequest('ksport/getstreamstatesome', 'POST', {bcEventIDs}).subscribe(res => {
      if (res.result) {
        this.liveStreamIds = [];
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

  getData() {
    this.websocketService.sendMessage({
      "command": "get",
      "params": {
        "source": "betting",
        "what": {
          "sport": [],
          "game": '@count'
        },
        subscribe: true,
        where: {
          sport: {
            type: {
              '@nin': [1, 4],
            },
          },
          game: {
            type: 1,
          }
        },
      },
      rid: 'OHB-inPlayLiveGames',
    });
    this.websocketService.sendMessage({
      "command": "get",
      "params": {
        "source": "betting",
        "what": {
          "sport": [],
          "game": '@count'
        },
        subscribe: true,
        where: {
          sport: {
            type: {
              '@nin': [1, 4],
            },
          },
          game: {
            type: 1,
          },
          market: {
            type: {
            },
          },
        },
      },
      rid: 'OHB-inPlayLiveGamesCount',
    });

    this.websocketService.getData().pipe(takeUntil(this.destroy$)).subscribe((data) => {
      if (data.rid === 'OHB-inPlayLiveGames') {
        if (!data.data || !data.data.data || !data.data.data.sport) {
          return;
        }
        this.tempMenuEl = Object.assign({}, data.data.data.sport);
        this.menuSubId = data.data.subid;
        this.menuElements = [..._.sortBy([..._.values(data.data.data.sport).filter(x => x.order > 500)], o => o.order)];
        this.activeEl = this.menuElements[0].alias;
        this.activeSportId = this.menuElements[0].id;
        this.selectMarketType();
      }
      if (data.rid === 'OHB-inPlayLiveGamesCount') {
        let total = 0;
        for (const key in data.data.data.sport) {
          if (data.data.data.sport.hasOwnProperty(key)) {
            total += data.data.data.sport[key]['game'];
          }
        }
        this.totalEvents = total;
      }
      if (data.data !== null && data.data[this.menuSubId]) {
        this.tempMenuEl = JSON.parse(
          JSON.stringify(
            _.merge(this.tempMenuEl, data.data[this.menuSubId].sport)
          )
        );
        this.menuElements = [..._.sortBy([..._.values(_.cloneDeep(this.tempMenuEl)).filter(x => x && x.order > 500)], o => o.order)];
      }
      if (data.rid === 'OHB-inPlaySection-body') {
        if (!data.data || !data.data.data || !data.data.data.sport) {
          return;
        } else {
          this.bodySubId = data.data.subid;
          let game;
          if (data.data && data.data.data && data.data.data.sport && data.data.data.sport[this.activeSportId] && data.data.data.sport[this.activeSportId].game) {
            game = data.data.data.sport[this.activeSportId].game;
          }
          this.tempObj = Object.assign({}, game);
          const arr = JSON.parse(
            JSON.stringify(
              _.values(game)
            )
          );
          this.orderPromoted(arr);
          this.getStreamInfo();
          if (this.liveInterval) {
            clearInterval(this.liveInterval);
          }
          this.liveInterval = setInterval(() => {
            this.getStreamInfo();
          }, 60 * 1000);
        }
      }
      if (data.data !== null && data.data[this.bodySubId] && Object.keys(data.data[this.bodySubId].sport).length) {
        this.tempObj = Object.assign(
          {},
          _.mergeWith(
            {},
            this.tempObj,
            data.data[this.bodySubId].sport[this.activeSportId].game,
            (a, b) => (b === null ? a : undefined)
          )
        );
        const inPlayOldData = _.cloneDeep(this.inPlayNewTable);
        const arr = JSON.parse(
          JSON.stringify(_.values(this.tempObj))
        );
        if (this.activeSportId === 1) {
          this.checkForGoal(inPlayOldData);
        }
        this.orderPromoted(arr);
        if (this.activeSportId === 1) {
          this.handleFootballEnd();
        }
      }
    });
  }

  handleFootballEnd () {
    this.inPlayNewTable = this.inPlayNewTable.filter(eachGame => {
      return eachGame.info.current_game_time !== '90' || Object.keys(eachGame.market).length !== 0;
    });
  }

  orderPromoted(arr) {
    const promoted = arr.filter(x => x.promoted).sort((a, b) => {
      return <any>new Date(a.start_ts * 1000) - <any>new Date(b.start_ts * 1000);
    });
    const notPromoted = arr.filter(x => !x.promoted).sort((a, b) => {
      return <any>new Date(a.start_ts * 1000) - <any>new Date(b.start_ts * 1000);
    });
    this.inPlayNewTable = [...promoted, ...notPromoted];
    this.adjustWidth();
  }

  selectMarketType() {
    this.jsonService.getJson(`market-types`).pipe(takeUntil(this.destroy$)).subscribe((data) => {
      const dropDownListBySport = data['types'];
      const idx = dropDownListBySport.findIndex(x => x.id === this.activeSportId);
      if (idx !== -1) {
        const defOption = dropDownListBySport[idx].marketTypes.default;
        this.marketType = defOption ? defOption.optionName : 'MatchResult';
        this.actualTableHeader = defOption ? MARKET_TYPE_HEADER[defOption.optionValue] : MARKET_TYPE_HEADER['P1XP2'];
        this.getBodyData();
      } else {
        this.marketType = 'MatchResult';
        this.getBodyData();
      }
    });
  }

  adjustWidth() {
    if (this.innerWidth > 767) {
      this.utility.adjustWidth(this.timeDivs);
    }
  }

  getBodyData() {
    this.websocketService.sendMessage({
      command: 'get',
      params: {
        source: 'betting',
        what: {
          sport: ['id'],
          game: [[
            'id',
            'team1_name',
            'team2_name',
            'order',
            'start_ts',
            'events_count',
            'markets_count',
            'is_blocked',
            'is_live',
            'info',
            'promoted',
            'is_started',
            'match_length']
          ],
          market: ['name', 'type', 'market_type', 'id', 'base', 'express_id'],
          event: ['name', 'type', 'id', 'price', 'base', 'order', 'type_1'],
        },
        subscribe: true,
        where: {
          sport: {
            type: {
              '@nin': [1, 4],
            },
            id: {
              '@in': [this.activeSportId],
            },
          },
          game: {
            type: 1
          },
          market: {
            market_type: {
              '@in': [this.marketType],
            },
          },
        },
      },
      rid: 'OHB-inPlaySection-body',
    });
  }

  orderAsc = (akv: KeyValue<string, any>, bkv: KeyValue<string, any>): number => {
    const a = akv.value.order;
    const b = bkv.value.order;
    return a > b ? 1 : (b > a ? -1 : 0);
  };

  checkForGoal(inPlayData) {
    inPlayData.forEach(oldData => {
      const idx = this.inPlayNewTable.findIndex(x => x.id === oldData.id);
      if (idx !== -1) {
        if (Number(this.inPlayNewTable[idx].info.score1) > Number(oldData.info.score1)) {
          this.inPlayNewTable[idx].team1_goal = true;
          setTimeout(() => {
            this.inPlayNewTable[idx].team1_goal = false;
          }, 1000);
        }
        if (Number(this.inPlayNewTable[idx].info.score2) > Number(oldData.info.score2)) {
          this.inPlayNewTable[idx].team2_goal = true;
          setTimeout(() => {
            this.inPlayNewTable[idx].team2_goal = false;
          }, 1000);
        }
      }
    });
  }

  watchLive(game) {
    localStorage.setItem('liveStreamUrl', game.id.toString());
    this.router.navigate([`/sportsbook/in-play/event-view/${this.activeEl}/${this.activeSportId}/${game.id}`]);
  }

  showAnimation(game) {
    this.router.navigate([`/sportsbook/in-play/event-view/${this.activeEl}/${this.activeSportId}/${game.id}`]);
  }

  getCurrentTime(time) {
    time = time.split(':')[0];
    return this.utility.handleSingleDigit(time);
  }

  getInPlays(sportType) {
    this.utility.resetWidth(this.timeDivs);
    this.assignment = 0;
    this.inPlayNewTable.map(item => {
      item.match_time = 0;
    });
    this.inPlayNewTable = [];
    this.activeEl = sportType.alias;
    this.activeSportId = sportType.id;
    this.websocketService.sendMessage({
      command: 'unsubscribe',
      params: {
        subid: this.bodySubId,
      },
    });
    this.selectMarketType();
    this.bodySubId = '';
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
        marketType: market.value['type'],
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
        isAsian: this.isAsian(market.value['type']),
        asianBase: this.isAsian(market.value['type']) ? this.formatBase.transform(pick.value['base']) : false,
      });
    }
    this.picksInBetslip = [...this.betSlipService.getArrayOfPicks()];
  }
  isAsian(str): boolean {
    return str.toLowerCase().indexOf('asian') !== -1;
  }
  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
    this.websocketService.sendMessage({
      command: 'unsubscribe_bulk',
      params: {
        subids: [this.bodySubId, this.menuSubId],
      },
    });
    if (this.liveInterval) {
      clearInterval(this.liveInterval);
    }
    document.removeEventListener('visibilitychange', this.visibilityChangeCallback, true);
  }

  shouldHasPickedClass(inCart, id) {
    return this.picksInBetslip.includes(id);
  }

  test(_object) {
    const array = [];
    const obj = Object.assign({}, _object);
    Object.keys(obj).forEach((key, index) => {
      if (obj[key] && obj[key] !== 'null' && obj[key] !== 'undefined') {
        array.push(obj[key]);
        obj[key].marketDisplayer = [];
        Object.keys(obj[key].market).forEach((key1, index1) => {
          obj[key].marketDisplayer.push(obj[key].market[key1]);
          obj[key].market[key1].eventDisplayer = [];
          _.values(obj[key].market[key1]);
          Object.keys(obj[key].market[key1].event).forEach((key2, index2) => {
            obj[key].market[key1].eventDisplayer.push(
              obj[key].market[key1].event[key2]
            );
          });
        });
      } else {
      }
    });
    return array;
  }

  trackByFn(index, item) {
    return index;
  }

  replaceNull(someObj, replaceValue = {}) {
    const replacer = (key, value) =>
      String(value) === 'null' || String(value) === 'undefined'
        ? replaceValue
        : value;

    return JSON.parse(JSON.stringify(someObj, replacer));
  }

  getWidth() {
    return this.innerWidth < 993 ? `calc(100vw - 182px)` : this.innerWidth > 992 && this.innerWidth < 1600 ? `calc(100% - ${100 * this.actualTableHeader.length}px)` : 'unset';
  }

  goToInPlay(e) {
    const team1 = e.team1_name.replace(/\s+/g, '-').toLowerCase();
    const team2 = e.team2_name.replace(/\s+/g, '-').toLowerCase();
    this.router.navigate([`/sportsbook/in-play/event-view/${this.activeEl}/${this.activeSportId}/${e.id}`]);
  }

}
