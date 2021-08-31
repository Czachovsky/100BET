import { Component, OnInit } from '@angular/core';
import { JsonService } from '../../../shared/services/json/json.service';
import { TranslateService } from '@ngx-translate/core';
import { WebsocketService } from '../../../shared/services/websocket/websocket.service';
import * as _ from 'lodash';
import { SubscriptionsService } from '../../../shared/services/subscriptions/subscriptions.service';
import { Subscription } from 'rxjs';
import { BetSlipService } from '../../../shared/services/bet-slip/bet-slip.service';
import { MARKET_TYPE_HEADER } from '../../../shared/enums/market-type-headers';
import { Router } from '@angular/router';
import { KeyValue } from '@angular/common';
import { FormatBasePipe } from '../../../shared/pipes/format-base.pipe';
import { OddsService } from '../../../shared/services/odds/odds.service';
@Component({
  selector: 'workspace-upcoming',
  templateUrl: './upcoming.component.html',
  styleUrls: ['./upcoming.component.scss'],
})
export class UpcomingComponent implements OnInit {
  activeEl: string;
  upcomingTable: any;
  elementsObj: any;
  defaoultOption: any = {};
  selectOptions: any = [];
  dropDownListBySport: any = [];
  actualTimeStamp: any;
  menuElements: any = [];
  activeSportId: number;
  upcomingTableV2: any;
  actualTableHeader: any = [];
  activeMarket: string;
  isLoading: boolean;
  minTimestamp: any;
  maxTimestamp: any;
  languageChange: Subscription;
  picksInBetslip: any = [];
  betSlipCartChanged: Subscription;

  constructor(
    private jsonService: JsonService,
    public subscriptionsService: SubscriptionsService,
    public translate: TranslateService, private router: Router,
    private websocketService: WebsocketService,
    private betSlipService: BetSlipService,
    private formatBase: FormatBasePipe,
    public os: OddsService
  ) {
    this.jsonService
      .getJson(`market-types`)
      .subscribe((data) => {
        this.dropDownListBySport = data['types'];
      });
    this.picksInBetslip = [...this.betSlipService.getArrayOfPicks()];
    this.betSlipCartChanged = this.subscriptionsService
      .getBetSlipChanges()
      .subscribe((data) => {
        if (data) {
          this.picksInBetslip = [...this.betSlipService.getArrayOfPicks()];
        }
      });
    this.languageChange = this.subscriptionsService.getLanguage().subscribe(lang => {
      if(lang){
        this.getData();
      }
    });
  }

  ngOnInit(): void {
    const minDate = new Date();
    const maxDate = new Date();
    this.maxTimestamp = maxDate.setHours(24,0,0,0);
    this.maxTimestamp = maxDate.getTime() / 1000
    this.minTimestamp = minDate.getTime() / 1000;
    this.activeSportId = 1;
    this.activeEl = 'Soccer';
    this.getData();
  }

  orderAsc = (akv: KeyValue<string, any>, bkv: KeyValue<string, any>): number => {
    const a = akv.value.order;
    const b = bkv.value.order;
    return a > b ? 1 : (b > a ? -1 : 0);
  };

  getData() {
    this.websocketService.sendMessage({
      "command": "get",
      "params": {
        "source": "betting",
        "what": {
          "sport": []
        },
        "subscribe": false,
        "where": {
          "game": {
            "type":2,
            "start_ts": {
              "@gte": this.minTimestamp,
              "@lte": this.maxTimestamp
            }
          }
        }
      },
      "rid": "OHB-upcomingGames",
    })

    this.websocketService.getData().subscribe((data) => {
      if (data.rid === "OHB-upcomingGames") {
        this.menuElements = [..._.sortBy([..._.values(data.data.data.sport).filter(x => x.order > 500)], o => o.order)];
        this.setDropDownList(this.menuElements[0]);
      }
      if (data.rid === `OHB-upcoming-${this.actualTimeStamp}`){
        if (!_.isEmpty(data.data.data.sport) && data.data.data.sport[this.activeSportId] && data.data.data.sport[this.activeSportId].game) {
          const upcomingTableV2 = JSON.parse(JSON.stringify(_.values(data.data.data.sport[this.activeSportId].game)));
          const promoted = upcomingTableV2.filter(x => x.promoted).sort((a, b) => {
            return <any>new Date(a.start_ts * 1000) - <any>new Date(b.start_ts * 1000);
          });
          const notPromoted = upcomingTableV2.filter(x => !x.promoted).sort((a, b) => {
            return <any>new Date(a.start_ts * 1000) - <any>new Date(b.start_ts * 1000);
          });
          this.upcomingTableV2 = [...promoted, ...notPromoted];
        } else {
          this.upcomingTableV2 = [];
        }
      }
    });
  }

  getUpcoming(sportType) {
    this.activeEl = sportType.alias;
    this.activeSportId = sportType.id;
    this.upcomingTableV2 = [];
    this.setDropDownList(sportType);
  }

  setDropDownList(sport) {
    const idx = this.dropDownListBySport.findIndex(x => x.id === sport.id);
    if (idx !== -1) {
      this.selectOptions = this.dropDownListBySport[idx].marketTypes.options;
      const defOption = this.dropDownListBySport[idx].marketTypes.default;
      this.defaoultOption = defOption ? defOption : this.selectOptions[0];
      this.selectMarket(this.defaoultOption);
    } else {
      this.selectOptions = [];
      this.defaoultOption = {};
      this.selectMarket({optionValue: 'P1XP2', optionName: 'MatchWinner3'});
    }
  }

  selectMarket(e) {
    this.isLoading = true;
    this.activeMarket = e.optionName;
    const marketType = [e.optionName];
    this.actualTableHeader = MARKET_TYPE_HEADER[e.optionValue];
    this.websocketService.sendMessage({
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
        "subscribe": false,
        "where": {
          "sport": {
            "id": this.activeSportId
          },
          "region": {
            "@node_limit": 8
          },
          "competition": {
            "@node_limit": 8
          },
          "game": {
            "type":2,
            "@node_limit": 8,
            "start_ts": {
              "@gte": this.minTimestamp,
              "@lte": this.maxTimestamp
            }
          },
          "market": {
            "@node_limit": 1,
            "market_type": {
              "@in": marketType
            }
          }
        }
      },
      "rid": `OHB-upcoming-${this.getTimestamp()}`
    });
    this.isLoading = false;
  }

  getTimestamp(){
    const date = new Date();
    const timestamp = date.getTime();
    this.actualTimeStamp = timestamp;
    return timestamp;
  }

  prepareMenuObj(obj){
    const menu = [];
    Object.keys(obj).forEach((key, index) => {
      menu.push(obj[key]);
    });

    return menu;
  }


  todayOrTomorrow(timestamp) {
    const d = new Date(timestamp);
    if (new Date().getDate() !== d.getDate()) {
      return d;
    }
  }

  addBetToCart(pick, item, market){
    if (this.picksInBetslip.includes(pick.value['id'])) {
      this.betSlipService.removePickFromBetSlip(pick.value['id']);
    } else {
      this.betSlipService.addPickToBetSlip({
        event_ts: item.start_ts,
        competitionId: item.competitionID,
        competitionName: item.competition,
        eventId: pick.value['id'],
        eventType: pick.value['type'],
        expressId: market.value['express_id'],
        gameId: item['id'],
        marketId: market.value['id'],
        marketName: market.value['name'],
        marketType: market.value['market_type'],
        price: pick.value['price'],
        team1Name: item.team1_name,
        team2Name: item.team2_name,
        selectedOption: pick.value['name'],
        isLive: item.is_live,
        isStarted: item.is_started,
        isBlocked: item.is_blocked,
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
  shouldHasPickedClass(inCart, id) {
    return this.picksInBetslip.includes(id);
  }

  redirectTo(game) {
    this.router.navigate([`/sportsbook/markets/${this.activeEl}/${this.activeSportId}/${game.id}`]);
  }
  isAsian(str): boolean {
    return str.toLowerCase().indexOf('asian') !== -1;
  }
}
