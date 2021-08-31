import { Component, OnDestroy, OnInit } from '@angular/core';
import { JsonService } from '../../../shared/services/json/json.service';
import { OwlOptions } from 'ngx-owl-carousel-o';
import { SubscriptionsService } from '../../../shared/services/subscriptions/subscriptions.service';
import { Pick } from '../../../shared/interfaces/pick';
import { TranslateService } from '@ngx-translate/core';
import { WebsocketService } from '../../../shared/services/websocket/websocket.service';
import * as _ from 'lodash';
import { BetSlipService } from "../../../shared/services/bet-slip/bet-slip.service";
import { Subscription } from "rxjs";
import { GAME_STATES } from "../../../shared/game-states";
import { FormatBasePipe } from '../../../shared/pipes/format-base.pipe';
import { HttpService } from '../../../shared/services/http/http.service';
import { OddsService } from '../../../shared/services/odds/odds.service';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';
@Component({
  selector: 'workspace-featured',
  templateUrl: './featured.component.html',
  styleUrls: ['./featured.component.scss'],
})
export class FeaturedComponent implements OnInit, OnDestroy {
  featuredArray: any = [];
  featuredNewArray: any = [];
  pickInterface: Pick;
  cartFromLocalStorage: any;
  featuredArrayLenght: any;
  subidFeatured: string;
  tempObject: any;
  picksInBetslip: any;
  language: string;
  liveInterval;
  languageChange: Subscription;
  featuredCarouselOptions: OwlOptions = {
    loop: true,
    dots: false,
    nav: false,
    navText: ['', ''],
    autoplay: false,
    autoplayTimeout: 10000,
    autoplayHoverPause: true,
    autoplayMouseleaveTimeout: 2000,
    responsive: {
      0: {
        items: 1.3,
      },
      550: {
        items: 2,
      },
      740: {
        items: 3,
      },
    },
  };
  betSlipSubscription: Subscription;
  firstLoad = true;
  liveStreamIds: Array<number> = [];
  constructor(
    private httpSer: HttpService,
    private jsonService: JsonService,
    public subscriptionsService: SubscriptionsService,
    public translate: TranslateService,
    private router: Router,
    private websocketService: WebsocketService,
    private betSlipService: BetSlipService,
    private formatBase: FormatBasePipe,
    private datePipe: DatePipe,
    public os: OddsService
  ) {
    this.featuredArrayLenght = 0;
    this.language = localStorage.getItem('pageLanguage');

    this.languageChange = this.subscriptionsService.getLanguage().subscribe(lang => {
      if(lang){
        this.getData();
      }
    });
  }

  ngOnInit(): void {

    this.betSlipSubscription = this.subscriptionsService.getBetSlipChanges().subscribe(data => {
      if (data) {
        this.picksInBetslip = [...this.betSlipService.getArrayOfPicks()];
      }
    })

    this.picksInBetslip = [...this.betSlipService.getArrayOfPicks()];
    this.getData();
  }

  getData() {
    this.websocketService.sendMessage({
      command: 'get',
      params: {
        source: 'betting',
        what: {
          competition: ['id', 'name'],
          game: ['id','info','is_blocked','is_live','is_started','start_ts','team1_name','team2_name'],
          market: [],
          event: [],
        },
        where: {
          "sport": {
            id: 1
          },
          game: {
            promoted: true,
          },
          market: {
            type: 'AsianHandicap',
            '@node_limit': 1,
          },
        },
        subscribe: true,
      },
      rid: 'OHB-featuredMain',
    });

    this.websocketService.getData().subscribe((data) => {
      if (data.rid === 'OHB-featuredMain') {
        this.subidFeatured = data.data.subid;
        this.tempObject = Object.assign({}, data.data.data.competition);
        this.featuredNewArray = this.transformBcObject(JSON.parse(JSON.stringify(data.data.data.competition)));
        this.featuredArray = this.transformMobileData(JSON.parse(JSON.stringify(data.data.data.competition)));
        if (this.firstLoad) {
          this.firstLoad = false;
          this.getStreamInfo();
          if (this.liveInterval) {
            clearInterval(this.liveInterval);
          }
          this.liveInterval = setInterval(() => {
            this.getStreamInfo();
          }, 60 * 1000);
        }
      }
      if (data && data.data && data.data[this.subidFeatured]) {
        this.tempObject = Object.assign({}, _.mergeWith(
          {},
          this.tempObject,
          data.data[this.subidFeatured].competition,
          (a,b)=>b === null ? a : undefined));
        this.featuredNewArray = this.transformBcObject(JSON.parse(JSON.stringify(this.tempObject)));
        this.featuredArray = this.transformMobileData(JSON.parse(JSON.stringify(this.tempObject)));
      }
    });
  }

  getStreamInfo() {
    const bcEventIDs = this.featuredNewArray.reduce((r, {game}) => {
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

  ngOnDestroy() {
    if (this.liveInterval) {
      clearInterval(this.liveInterval);
    }
  }

  redirectTo(game) {
    if (!game.is_started) {
      this.router.navigate([`/sportsbook/markets/Soccer/1/${game.id}`]);
    } else {
      this.router.navigate([`/sportsbook/in-play/event-view/Soccer/1/${game.id}`]);
    }
  }

  transformBcObject(obj) {
    const newObj = Object.assign({}, obj)
    const arr = Array.from(_.values(newObj).filter((e) => (e.game = _.values(e.game))));

    return arr;
  }

  transformMobileData(obj) {
    const newObj = Object.assign({}, obj)
    const gamesArr = [];
    const arr = Array.from(_.values(newObj).filter((e) => (e.game = _.values(e.game))));
    arr.map((e, i) => {
      e.game.map((x) => {
        x.competition = e.name;
        x.competitionID = e.id;
        gamesArr.push(x);
      });
    });

    return gamesArr;
  }

  addBetToCart(pick, featured, market){
    if(this.picksInBetslip.includes(pick.value['id'])){
      this.betSlipService.removePickFromBetSlip(pick.value['id'])
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
  makeChosenOrNot(firstArr, secondArr) {
    const tempArr1 = secondArr.map((e) => e.id);
    firstArr.forEach((e) => {
      e.featuredPicks.filter((f) => {
        if (tempArr1.includes(f.id)) {
          f.inCart = true;
        }
      });
    });
    return firstArr;
  }

  shouldHasPickedClass(id){
    return this.picksInBetslip.includes(id);
  }
  getGameState(state){
    if(state !== '' && state !== 'Half Time' && (GAME_STATES[state].hasOwnProperty('1'))){
      return GAME_STATES[state]['1'][this.language]
    } else {
      if(state === 'Half Time'){
        return
      } else {
        return GAME_STATES[state]['others'][this.language]
      }
    }
  }
  todayOrTomorrow(timestamp) {
    if (new Date().getDate() === new Date(timestamp).getDate()) {
      return this.translate.instant('rest.today');
    } else {
      return this.datePipe.transform(timestamp, 'MM/dd');
    }
  }
}
