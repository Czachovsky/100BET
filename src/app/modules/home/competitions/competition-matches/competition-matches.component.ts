import { Component, OnInit, Output, EventEmitter, OnDestroy } from '@angular/core';
import { ActivatedRoute, ActivationEnd, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { JsonService } from '../../../../shared/services/json/json.service';
import { UtilityService } from '../../../../shared/services/utility.service';
import { WebsocketService } from '../../../../shared/services/websocket/websocket.service';
import { Subject, Subscription } from 'rxjs';
import { filter, map, takeUntil } from 'rxjs/operators';
import * as _ from "lodash";
import { MARKET_TYPE_HEADER } from '../../../../shared/enums/market-type-headers';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'workspace-competition-matches',
  templateUrl: './competition-matches.component.html',
  styleUrls: ['./competition-matches.component.scss']
})
export class CompetitionMatchesComponent implements OnInit, OnDestroy {

  defaoultOption: any;
  selectOptions: any;
  selectedMarket;
  language: string;
  sportsOddsData = [];
  sportName: string;
  routerSubscription: Subscription;
  actualTableHeader: any;
  destroy$: Subject<boolean> = new Subject<boolean>();
  emptyList: boolean;
  bodySubid: any;
  tempBodyObj;
  sportId;
  @Output() fullSportName: EventEmitter<any> = new EventEmitter<any>();

  constructor(
    private websocket: WebsocketService,
    private actRoute: ActivatedRoute, private datePipe: DatePipe,
    private router: Router, private utility: UtilityService,
    private jsonService: JsonService,
    public translate: TranslateService) {
    this.language = localStorage.getItem('pageLanguage');
  }

  ngOnInit(): void {

    this.sportName = this.utility.decodeSportAlias(this.actRoute.snapshot.paramMap.get('sport'));
    this.setDropDownList();

    this.routerSubscription = this.router.events.pipe(
      filter(event => event instanceof ActivationEnd),
      map((event: any) => event.snapshot)).subscribe(e => {
      if (e.params.sport) {
        this.sportName = this.utility.decodeSportAlias(e.params.sport);
        this.setDropDownList();
      }
    });

    this.websocket.getData().subscribe((data) => {
      if (data.data && data.data !== 'null' && data.data !== 'undefined') {
        if (data.rid === 'OHB-competition-matches-list') {
          if(!_.isEmpty(data.data.data.sport)){
            this.sportId = _.values(data.data.data.sport)[0].id;
            this.bodySubid = data.data.subid;
            const competition = _.values(data.data.data.sport)[0].competition;
            this.fullSportName.emit(_.values(data.data.data.sport)[0].name + ' / ' + _.values(competition)[0].name);
            const game = _.values(competition)[0].game;
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
            const competition = _.values(data.data[this.bodySubid].sport)[0].competition;
            const game = _.values(competition)[0].game;
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
      e.market = _.values(e.market);
    });
    oddsData.sort((x, y) => {
      return x.start_ts - y.start_ts;
    });
    oddsData.map(x => x.startTime = this.datePipe.transform(x.start_ts * 1000, 'EEE dd MMMM'))
    this.sportsOddsData = _.cloneDeep(
      _.chain(oddsData)
        .groupBy('startTime')
        .map((value, key) => ({ startTime: key, game: value }))
        .value()
    );
  }

  setDropDownList() {
    this.jsonService.getJson(`market-types`).pipe(takeUntil(this.destroy$)).subscribe((data) => {
      const dropDownListBySport = data['types'];
      const idx = dropDownListBySport.findIndex(x => x.alias === this.sportName);
      if (idx !== -1) {
        this.selectOptions = dropDownListBySport[idx].marketTypes.options;
        const defOption = dropDownListBySport[idx].marketTypes.default;
        this.defaoultOption = defOption ? defOption : this.selectOptions[0];
        this.selectMarket(this.defaoultOption);
      } else {
        this.selectOptions = [];
        this.defaoultOption = {};
        this.selectMarket({optionValue: 'MatchResult', optionName: 'MatchWinner3'});
      }
    });
  }

  selectMarket(e) {
    this.selectedMarket = e;
    this.getTableData(e);
  }

  getTableData(e) {
    this.actualTableHeader = MARKET_TYPE_HEADER[e.optionValue];
    const marketType = [e.optionName];
    this.websocket.sendMessage({
      "command": "get",
      "params": {
        "source": "betting",
        "what": {
          "sport": [
            "name",
            "alias",
            "id",
            "order",
            "type"
          ],
          competition: [],
          "game": [[
            "id",
            "team1_name",
            "team2_name",
            "team1_id",
            "team2_id",
            "order",
            "start_ts",
            "events_count",
            "markets_count",
            "is_blocked",
            "info",
            "exclude_ids",
            "team1_reg_name",
            "team2_reg_name",
            "type",
            "video_id",
            "tv_type",
            "is_stat_available",
            "is_live"
          ]],
          "market": [
            "name",
            "type",
            "market_type",
            "id",
            "base",
            "express_id"
          ],
          "event": [
            "name",
            "type",
            "id",
            "price",
            "base",
            "order",
            "type_1"
          ]
        },
        "subscribe": true,
        "where": {
          "sport": {
            "alias": this.sportName
          },
          "region": {
            "id": Number(this.actRoute.snapshot.params['region'])
          },
          "competition": {
            "id": Number(this.actRoute.snapshot.params.competitionId)
          },
          "game": {
            "type":2
          },
          "market": {
            "market_type": {
              "@in": marketType
            }
          }
        }
      },
      "rid": `OHB-competition-matches-list`
    });
  }

  getCompetitionName() {
    const competition = this.actRoute.snapshot.params.competitionId;
    return competition.split('-').map(str => {
      return str.charAt(0).toUpperCase() + str.slice(1);
    }).join(' ');
  }

  redirectTo(match) {
    this.router.navigate([`/sportsbook/markets/${this.sportName}/${this.sportId}/${match.id}`]);
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
    this.routerSubscription.unsubscribe();
  }

}
