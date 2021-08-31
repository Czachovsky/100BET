import { ChangeDetectorRef, Component, ElementRef, EventEmitter, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import {AnimationsService} from "../../../../shared/services/animations/animations.service";
import {WEEK_DAYS} from "../../../../shared/week-days"
import { WebsocketService } from "../../../../shared/services/websocket/websocket.service";
import { ActivatedRoute, ActivationEnd, Router } from "@angular/router";
import { filter, map, takeUntil } from "rxjs/operators";
import * as _ from "lodash";
import { JsonService } from "../../../../shared/services/json/json.service";
import { TranslateService } from "@ngx-translate/core";
import { TABLES_HEADER } from '../../../../shared/tables-header'
import { Subject, Subscription } from "rxjs";
import { MARKET_TYPE_HEADER } from '../../../../shared/enums/market-type-headers';
@Component({
  selector: 'workspace-daily-matches',
  templateUrl: './daily-matches.component.html',
  styleUrls: ['./daily-matches.component.scss']
})
export class DailyMatchesComponent implements OnInit, OnDestroy {

  defaoultOption: any;
  selectOptions: any;
  selectedMarket;
  datesArr: any = [];
  language: string;
  minRange: any;
  maxRange: any;
  sportName: any;
  competitionObject: any = [];
  sportsOddsData: any = [];
  @Output() fullSportName: EventEmitter<any> = new EventEmitter<any>();
  actualTableHeader: any;
  routerSubscription: Subscription;
  destroy$: Subject<boolean> = new Subject<boolean>();
  emptyList: boolean;
  @ViewChild('scrollEl') scrollEl: ElementRef;
  bodySubid: any;
  tempBodyObj;
  sportId;
  constructor(public cdRef:ChangeDetectorRef,
              private websocket: WebsocketService,
              private actRoute: ActivatedRoute,
              private router: Router,
              private jsonService: JsonService,
              public translate: TranslateService,) {
    this.language = localStorage.getItem('pageLanguage');
  }

  ngOnInit(): void {
    // this.jsonService.getJson(`select-${ this.translate.currentLang }`).subscribe(data => {
    //   this.defaoultOption = data["default"];
    //   this.selectOptions = data["options"];
    //   this.actualTableHeader = TABLES_HEADER[this.defaoultOption.optionValue];
    // })
    this.generateDatesList();
    this.calculateMaxMinRange(this.datesArr[0].timestamp);
    this.sportName = this.decodeSportAlias(this.actRoute.snapshot.paramMap.get('sport'));
    this.getSportData(this.minRange, this.maxRange, this.sportName);
    this.setDropDownList();
    this.routerSubscription = this.router.events.pipe(
      filter(event => event instanceof ActivationEnd),
      map((event: any) => event.snapshot)).subscribe(e => {
      if (e.params.sport) {
        this.sportName = this.decodeSportAlias(e.params.sport);
        this.getSportData(this.minRange, this.maxRange, this.sportName);
        this.setDropDownList();
      }
    })


    this.websocket.getData().subscribe((data) => {
      if (data.data && data.data !== 'null' && data.data !== 'undefined') {
        if (data.rid === 'OHB-sportpage-daily') {
          if(_.isEmpty(data.data.data.sport)){
            this.emptyList = true;
          } else {
            this.emptyList = false;
            this.sportId = _.values(data.data.data.sport)[0].id;
            this.competitionObject = _.values(_.values(data.data.data.sport)[0].region)
            this.fullSportName.emit(_.values(data.data.data.sport)[0].name);
            this.competitionObject.map((e,i) => {
              _.values(e['competition']).map((f, j) => (i === 0 && j === 0) ? f.extended = true : f.extended = false);
            });
          }
        }
        if (data.rid === 'OHB-sportpage-daily-table') {
          if(!_.isEmpty(data.data.data.game)){
            this.bodySubid = data.data.subid;
            this.tempBodyObj = JSON.parse(JSON.stringify(data.data.data.game));
            const oddsData = _.values(_.cloneDeep(this.tempBodyObj));
            oddsData.map(e => {
              e.market = _.values(e.market);
            });
            this.sportsOddsData = _.cloneDeep(oddsData);
          } else {
            this.emptyList = true;
          }
        }
        if (data.data !== null && data.data[this.bodySubid]) {
          if(!_.isEmpty(data.data[this.bodySubid].game)){
            const bodyObj = Object.assign({}, _.mergeWith(
              {},
              this.tempBodyObj,
              data.data[this.bodySubid].game));
            this.tempBodyObj = this.clean(bodyObj);
            const oddsData = _.values(_.cloneDeep(this.tempBodyObj));
            oddsData.map(e => {
              e.market = _.values(e.market);
            });
            this.sportsOddsData = _.cloneDeep(oddsData);
          } else {
            this.emptyList = true;
          }
        }
      }
    })
  }
  toggleTableBody(e){
    console.log(e)
  }
  changeMarket(e) {
    this.actualTableHeader = TABLES_HEADER[e.optionValue];
  }


  changeDate(date,i){
      this.datesArr[i].active = true;
      this.datesArr.map((e,index) => {if(index !== i)e.active = false });
      this.calculateMaxMinRange(date.timestamp);
      this.getSportData(this.minRange, this.maxRange, this.sportName);
      this.getTableData(this.selectedMarket);
  }

  selectMarket(e) {
    this.selectedMarket = e;
    this.getTableData(e);
  }

  generateDatesList(){
    this.datesArr = [];
    for(let i = 0; i < 7; i++) {
      const date = new Date();
      if(i !== 0){
        date.setHours(0,0,0,0);
      }
      date.setDate(date.getDate() + i);
      const day = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
      const month = date.getMonth() + 1 < 10 ? ('0' + (date.getMonth() + 1)) : date.getMonth() + 1;
      this.datesArr.push({
        today: i === 0 ? true : false,
        active:  i === 0 ? true : false,
        day: WEEK_DAYS[date.getDay()][this.language],
        date: `${day}/${month}`,
        timestamp: date.getTime()
      });
    }
    this.cdRef.detectChanges();

  }

  calculateMaxMinRange(timestamp){
      this.minRange = timestamp;
      const date = new Date(timestamp);
      date.setDate(date.getDate() + 1);
      date.setHours(0,0,0,0);
      this.maxRange = date.getTime();
  }

  calculateLength(e){
    return  _.values(e).length
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

  redirectTo(match) {
    this.router.navigate([`/sportsbook/markets/${this.sportName}/${this.sportId}/${match.id}`]);
  }

  getSportData(minTime, maxTime, sport){
    this.websocket.sendMessage({
      "command": "get",
      "params": {
        "source": "betting",
        "what": {
          "sport": [
            "id",
            "name",
            "alias",
            "order"
          ],
          "region": [
            "id",
            "name",
            "alias",
            "order"
          ],
          "competition": [
            "id",
            "order",
            "name"
          ],
          // "event": [
          //   "type",
          //   "id",
          //   "price",
          //   "name",
          //   "base",
          //   "order"
          // ],
          // "market": [
          //   "type",
          //   "name",
          //   "id",
          //   "base",
          //   "express_id"
          // ],
          "game": ["id"]
        },
        "where": {
          "sport": {
            "alias": `${ sport.split('-')[0].charAt(0).toUpperCase() }${ sport.split('-')[0].slice(1) }`
          },
          "game": {
            "start_ts": {
              "@gte": minTime / 1000,
              "@lte": maxTime / 1000
            },
            "type": 2
          },
          "market": {
            "type": {
              "@in": [
                "P1P2",
                "P1XP2"
              ]
            }
          }
        },
        "subscribe": false
      },
      "rid": "OHB-sportpage-daily"
    });
  }

  decodeSportAlias(alias) {
    return alias.split('-').map(e => {
      return e.charAt(0).toUpperCase() + e.slice(1);
    }).join('')
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
    this.routerSubscription.unsubscribe();
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
            "start_ts": {
              "@gte": this.minRange / 1000,
              "@lte": this.maxRange / 1000
            },
            "type": 2
          },
          "market": {
            "market_type": {
              "@in": marketType
            }
          }
        },
        "subscribe": true
      },
      "rid": `OHB-sportpage-daily-table`
    });
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
