import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { ActivatedRoute, ActivationEnd, Router } from '@angular/router';
import { WebsocketService } from '../../../../shared/services/websocket/websocket.service';
import { Subscription } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import * as _ from 'lodash';
import { AnimationsService } from '../../../../shared/services/animations/animations.service';
import { UtilityService } from '../../../../shared/services/utility.service';
import { SubscriptionsService } from '../../../../shared/services/subscriptions/subscriptions.service';
import { BetSlipService } from '../../../../shared/services/bet-slip/bet-slip.service';
import { FormatBasePipe } from '../../../../shared/pipes/format-base.pipe';
import { KeyValue } from '@angular/common';
import { OddsService } from '../../../../shared/services/odds/odds.service';

@Component({
  selector: 'workspace-competition-outrights',
  templateUrl: './competition-outrights.component.html',
  styleUrls: ['./competition-outrights.component.scss']
})
export class CompetitionOutrightsComponent implements OnInit {
  sportName: string;
  compName: string;
  @Output() fullSportName: EventEmitter<any> = new EventEmitter<any>();
  routerSubscription: Subscription;
  betSlipCartChanged: Subscription;
  bodySubid: any;
  emptyList: boolean;
  tempBodyObj;
  outrightData: any = [];
  picksInBetslip: any = [];
  objectKeys = Object.keys;

  constructor(
    private utility: UtilityService,
    private animationService: AnimationsService,
    public actRoute: ActivatedRoute,
    private router: Router,
    private betSlipService: BetSlipService,
    public subscriptionService: SubscriptionsService,
    private websocket: WebsocketService,
    private formatBase: FormatBasePipe,
    public os: OddsService) {
      this.picksInBetslip = [...this.betSlipService.getArrayOfPicks()];
      this.betSlipCartChanged = this.subscriptionService
        .getBetSlipChanges()
        .subscribe((data) => {
          if (data) {
            this.picksInBetslip = [...this.betSlipService.getArrayOfPicks()];
          }
        });
  }

  ngOnInit(): void {
    this.routerSubscription = this.router.events.pipe(
      filter(event => event instanceof ActivationEnd),
      map((event: any) => event.snapshot)).subscribe(e => {
      if (e.params.sport) {
        this.sportName = this.utility.decodeSportAlias(e.params.sport);
        this.getCompetition();
      }
    });
    this.sportName = this.utility.decodeSportAlias(this.actRoute.snapshot.paramMap.get('sport'));
    this.getCompetition();
    this.websocket.getData().subscribe((data) => {
      if (data.data && data.data !== 'null' && data.data !== 'undefined') {
        if (data.rid === `OHB-Competition`) {
          if (_.values(data.data.data.competition).length) {
            this.compName = _.values(data.data.data.competition)[0].name;
            this.getSportData();
          } else {
            this.emptyList = true;
          }
        }
        if (data.rid === `OHB-Competitions-Outrights`) {
          if(!_.isEmpty(data.data.data.sport)){
            this.fullSportName.emit(_.values(data.data.data.sport)[0].name + ' / ' + this.compName);
            this.bodySubid = data.data.subid;
            let competition = _.values(data.data.data.sport)[0].competition;
            competition = _.values(competition).filter(x => x.name.indexOf(this.compName) !== -1)[0];
            const game = competition.game;
            if(!_.isEmpty(game)){
              this.tempBodyObj = JSON.parse(JSON.stringify(game));
              this.formatData();
            } else {
              this.emptyList = true;
            }
          } else {
            this.emptyList = true;
          }
        }
        if (data.data !== null && data.data[this.bodySubid]) {
          if(!_.isEmpty(data.data[this.bodySubid].sport)){
            let competition = _.values(data.data[this.bodySubid].sport)[0].competition;
            competition = _.values(competition).filter(x => x.name.indexOf(this.compName) !== -1)[0];
            const game = competition.game;
            if(!_.isEmpty(game)){
              const bodyObj = Object.assign({}, _.mergeWith(
                {},
                this.tempBodyObj,
                game));
              this.tempBodyObj = this.utility.clean(bodyObj);
              this.formatData();
            } else {
              this.emptyList = true;
            }
          } else {
            this.emptyList = true;
          }
        }
      }
    });
  }

  formatData() {
    const oddsData = _.values(_.cloneDeep(this.tempBodyObj));
    oddsData.map(e => {
      e.market = _.values(e.market).sort((x, y) => {
        return x.order - y.order;
      });
    });
    oddsData.sort((x, y) => {
      return x.start_ts - y.start_ts;
    });
    this.outrightData = oddsData;
  }

  toggleTableBody(element) {
    this.animationService.slideToggle(element);
  }

  getCompetition() {
    this.websocket.sendMessage({
      "command": "get",
      "params": {
        "source": "betting",
        "what": {
          "competition": []
        },
        "where": {
          "sport": {
            "alias": `${ this.sportName.split('-')[0].charAt(0).toUpperCase() }${ this.sportName.split('-')[0].slice(1) }`
          },
          "region": {
            "id": Number(this.actRoute.snapshot.params['region'])
          },
          "competition": {
            "id": Number(this.actRoute.snapshot.params.competitionId)
          }
        },
        "subscribe": false
      },
      "rid": "OHB-Competition"
    });
  }

  getSportData() {
    const language = localStorage.getItem('pageLanguage');
    this.websocket.sendMessage({
      "command": "get",
      "params": {
        "source": "betting",
        "what": {
          "sport": [],
          "game": [],
          "competition": ['name'],
          "market": [],
          "event": []
        },
        "where": {
          "sport": {
            "alias": `${ this.sportName.split('-')[0].charAt(0).toUpperCase() }${ this.sportName.split('-')[0].slice(1) }`
          },
          "region": {
            "id": Number(this.actRoute.snapshot.params['region'])
          },
          "game": {
            "show_type": {
              "@eq": "OUTRIGHT"
            }
          },
          // "competition": {
          //   "name": {
          //     "@eq": this.compName + (language === 'zh' ? '- 冠军' : '. Outright')
          //   }
          // }
        },
        "subscribe": false
      },
      "rid": "OHB-Competitions-Outrights"
    })
  }

  getWidth(count) {
    return '1 0 ' + 100/count + '%';
  }

  orderAsc = (akv: KeyValue<string, any>, bkv: KeyValue<string, any>): number => {
    const a = akv.value.order;
    const b = bkv.value.order;
    return a > b ? 1 : (b > a ? -1 : 0);
  };

  shouldHasPickedClass(id) {
    return this.picksInBetslip.includes(id);
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
        expressId: market['express_id'],
        gameId: featured['id'],
        marketId: market['id'],
        marketName: market['name'],
        marketType: market['market_type'],
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
        isAsian: this.isAsian(market['market_type']),
        asianBase: this.isAsian(market['market_type']) ? this.formatBase.transform(pick.value['base']) : false,
      });
    }
    this.picksInBetslip = [...this.betSlipService.getArrayOfPicks()];
  }

  isAsian(str): boolean {
    return str.toLowerCase().indexOf('asian') !== -1;
  }
}
