import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, ActivationEnd, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { MARKET_TYPE_HEADER } from '../../../../shared/enums/market-type-headers';
import { Subject, Subscription } from 'rxjs';
import { filter, map, takeUntil } from 'rxjs/operators';
import { JsonService } from '../../../../shared/services/json/json.service';
import { WebsocketService } from '../../../../shared/services/websocket/websocket.service';
import * as _ from "lodash";
import { UtilityService } from '../../../../shared/services/utility.service';

@Component({
  selector: 'workspace-sports-highlights',
  templateUrl: './sports-highlights.component.html',
  styleUrls: ['./sports-highlights.component.scss']
})
export class SportsHighlightsComponent implements OnInit, OnDestroy {
  defaoultOption: any = {};
  selectOptions: any = [];
  sportName: any;
  selectedMarket;
  actualTableHeader: any;
  bodySubid: any;
  tempBodyObj;
  sportId;
  highlights: any = [];
  emptyList: boolean;
  routerSubscription: Subscription;
  destroy$: Subject<boolean> = new Subject<boolean>();
  constructor(
    private websocket: WebsocketService,
    private router: Router, private utility: UtilityService,
    private jsonService: JsonService, public translate: TranslateService,
    private actRoute: ActivatedRoute) { }

  ngOnInit(): void {
    this.sportName = this.decodeSportAlias(this.actRoute.snapshot.paramMap.get('sport'));
    this.setDropDownList();
    this.getSportId();
    this.routerSubscription = this.router.events.pipe(
      filter(event => event instanceof ActivationEnd),
      map((event: any) => event.snapshot)).subscribe(e => {
      if (e.params.sport) {
        this.sportName = this.decodeSportAlias(e.params.sport);
        this.setDropDownList();
      }
    })


    this.websocket.getData().subscribe((data) => {
      if (data.data && data.data !== 'null' && data.data !== 'undefined') {
        if (data.rid === 'OHB-sport-id') {
          this.sportId = _.values(data.data.data.sport)[0].id;
        }
        if (data.rid === 'OHB-sportpage-highlights-table') {
          if(!_.isEmpty(data.data.data.game)){
            this.bodySubid = data.data.subid;
            this.tempBodyObj = JSON.parse(JSON.stringify(data.data.data.game));
            const oddsData = _.values(_.cloneDeep(this.tempBodyObj));
            oddsData.map(e => {
              e.market = _.values(e.market);
            });
            this.highlights = _.cloneDeep(oddsData).sort((a, b) => {
              return <any>new Date(a.start_ts * 1000) - <any>new Date(b.start_ts * 1000);
            });
          } else {
            this.emptyList = true;
          }
        }
        if (data.data !== null && data.data[this.bodySubid]) {
          if(!_.isEmpty(data.data.data.game)){
            this.emptyList = false;
            const bodyObj = Object.assign({}, _.mergeWith(
              {},
              this.tempBodyObj,
              data.data[this.bodySubid].game));
            this.tempBodyObj = this.utility.clean(bodyObj);
            const oddsData = _.values(_.cloneDeep(this.tempBodyObj));
            oddsData.map(e => {
              e.market = _.values(e.market);
            });
            this.highlights = _.cloneDeep(oddsData).sort((a, b) => {
              return <any>new Date(a.start_ts * 1000) - <any>new Date(b.start_ts * 1000);
            });
          } else {
            this.emptyList = true;
          }
        }
      }
    })
  }

  decodeSportAlias(alias) {
    return alias.split('-').map(e => {
      return e.charAt(0).toUpperCase() + e.slice(1);
    }).join('')
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

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  selectMarket(e) {
    this.selectedMarket = e;
    this.getTableData(e);
  }

  redirectTo(match) {
    this.router.navigate([`/sportsbook/markets/${this.sportName}/${this.sportId}/${match.id}`]);
  }

  getTableData(e) {
    this.actualTableHeader = MARKET_TYPE_HEADER[e.optionValue];
    const marketType = [e.optionName];
    this.websocket.sendMessage({
      "command": "get",
      "params": {
        "source": "betting",
        "what": {
          "event": [
            "type",
            "id",
            "price",
            "name",
            "base",
            "order"
          ],
          "market": [],
          "game": [
            [
              "id",
              "markets_count",
              "start_ts",
              "team1_name",
              "team2_name",
              "team1_id",
              "team2_id",
              "tv_type",
              "info",
              "promoted",
              "video_id",
              "video_id2",
              "video_id3",
              "partner_video_id",
              "is_stat_available",
              "is_blocked",
              "game_number"
            ]
          ]
        },
        "where": {
          "sport": {
            "alias": this.sportName
          },
          "game": {
            "type": 2,
            "promoted": true
          },
          "market": {
            "market_type": {
              "@in": marketType
            }
          }
        },
        "subscribe": true
      },
      "rid": `OHB-sportpage-highlights-table`
    });
  }

  getSportId() {
    this.websocket.sendMessage({
      "command": "get",
      "params": {
        "source": "betting",
        "what": {
          sport: []
        },
        "where": {
          "sport": {
            "alias": this.sportName
          }
        },
        "subscribe": false
      },
      "rid": `OHB-sport-id`
    });
  }

}
