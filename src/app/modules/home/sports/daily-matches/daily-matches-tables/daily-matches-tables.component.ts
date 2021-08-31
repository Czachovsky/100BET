import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { TABLES_HEADER } from "../../../../../shared/tables-header";
import { JsonService } from "../../../../../shared/services/json/json.service";
import { TranslateService } from "@ngx-translate/core";
import * as _ from 'lodash';
import { WebsocketService } from "../../../../../shared/services/websocket/websocket.service";
import { Subscription } from "rxjs";
@Component({
  selector: 'workspace-daily-matches-tables',
  templateUrl: './daily-matches-tables.component.html',
  styleUrls: ['./daily-matches-tables.component.scss']
})
export class DailyMatchesTablesComponent implements OnInit, OnDestroy {
  @Input() sportsData: any;
  sportsDisplayData: any = [];
  defaultOption: any;
  selectOptions: any;
  actualTableHeader:any;
  language: string;
  selectedOption: any;
  subscriptionId: any;
  websocketSubscription: Subscription;
  constructor(private jsonService: JsonService,
              public translate: TranslateService,
              private websocket: WebsocketService) {
    this.language = localStorage.getItem('pageLanguage');
  }

  ngOnInit(): void {
    this.websocketSubscription = this.websocket.getData().subscribe((data) => {
      if (data.data && data.data !== 'null' && data.data !== 'undefined') {
        if (data.rid === `OHB-sportpage-daily-table-${this.subscriptionId}`) {
           this.sportsDisplayData = _.values(data.data.data.game);
          this.sportsDisplayData.map(e => {
            e.market = _.uniqBy(_.values(e.market), function(f){return f.name});
          });
        }
      }
    });

    this.jsonService.getJson(`select-${ this.translate.currentLang }`).subscribe(data => {
      this.defaultOption = data["default"];
      this.selectOptions = data["options"];
      this.selectedOption = 'P1XP2';
      this.actualTableHeader = TABLES_HEADER[this.defaultOption.optionValue];
      this.getMatchesData(
        this.sportsData['region'],
        this.sportsData['competition'],
        this.sportsData['minTime'],
        this.sportsData['maxTime'],
        this.selectedOption,
        this.sportsData['alias'])
    });
  }

  changeMarket(e) {
    this.actualTableHeader = TABLES_HEADER[e.optionValue];
    this.selectedOption = e.optionValue;
    console.log(e);
    this.getMatchesData(
      this.sportsData['region'],
      this.sportsData['competition'],
      this.sportsData['minTime'],
      this.sportsData['maxTime'],
      this.selectedOption,
      this.sportsData['alias'])
  }


  getMatchesData(region, competition, minRange, maxRange, market, sport){
    this.subscriptionId  = `${region}-${competition}`;
    let _market;
    let limit;
    if(market === 'P1XP2'){
      _market = ["P1P2", "P1XP2"];
      limit  = 1;
    } else if(market === 'AsianHandicap&GoalLine'){
      _market = ["P1P2", "P1XP2", "AsianHandicap"];
      limit = 99;
    } else {
      _market = market;
      limit = 1;
    }
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
          "market": [
            "type",
            "name",
            "id",
            "base",
            "express_id"
          ],
          "game": [
            [
              "id",
              "markets_count",
              "start_ts",
              "team1_name",
              "team2_name",
              "tv_type",
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
            "alias": sport
          },
          "game": {
            "start_ts": {
              "@gte": minRange / 1000,
              "@lte": maxRange / 1000
            },
            "type": 2
          },
          "market": {
            "@node_limit": limit,
            "type": {
              "@in": _market
            }
          },
          "competition": {
            "id": competition
          },
          "region": {
          "id": region
          },
        },
        "subscribe": false
      },
      "rid": `OHB-sportpage-daily-table-${this.subscriptionId}`
    });
  }

  ngOnDestroy() {
    this.websocketSubscription.unsubscribe();
  }

}
