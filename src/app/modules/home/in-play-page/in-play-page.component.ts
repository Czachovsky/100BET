import { Component, OnDestroy, OnInit } from '@angular/core';
import {SubscriptionsService} from "../../../shared/services/subscriptions/subscriptions.service";
import { ActivatedRoute } from '@angular/router';
import { WebsocketService } from '../../../shared/services/websocket/websocket.service';
import * as _ from 'lodash';
import { GameInfo } from '../../../components/markets/markets.component';
@Component({
  selector: 'workspace-in-play-page',
  templateUrl: './in-play-page.component.html',
  styleUrls: ['./in-play-page.component.scss']
})
export class InPlayPageComponent implements OnInit, OnDestroy {

  teamsArray: any;
  inPlayWholeObject: any = {};
  subId: any;
  gameInfo: GameInfo;
  tempObj: any = {};

  constructor(private actRoute: ActivatedRoute, private websocket: WebsocketService) {
    actRoute.params.subscribe(params => {
      this.gameInfo = {
        alias: params.alias,
        sportId: Number(params.sportId),
        gameId: Number(params.gameId)
      };
    });
  }

  ngOnInit(): void {
    // this.teamsArray = [...this.decodeMatchTeams(this.actRoute.snapshot.paramMap.get('teams'))];
    // console.log(this.teamsArray);

    // this.websocket.sendMessage({
    //   "command": "get",
    //   "params": {
    //     "source": "betting",
    //     "what": {
    //       "sport": [],
    //       "competition": [
    //         "id",
    //         "name"
    //       ],
    //       "game": [
    //         "id",
    //         "markets_count",
    //         "start_ts",
    //         "is_started",
    //         "is_blocked",
    //         "team1_id",
    //         "team2_id",
    //         "game_number",
    //         "text_info",
    //         "is_stat_available",
    //         "match_length",
    //         "type",
    //         "info",
    //         "stats",
    //         "team1_name",
    //         "team2_name",
    //         "tv_info",
    //         "add_info_name",
    //         "showInfo",
    //         "live_events",
    //         "last_event",
    //         "add_info"
    //       ],
    //       "market": [
    //         "name",
    //         "type",
    //         "id",
    //         "base",
    //         "express_id",
    //         "order",
    //         "group_name",
    //         "cashout",
    //         "group_id",
    //         "col_count",
    //         "point_sequence"
    //       ],
    //       "event": [
    //         "id",
    //         "order",
    //         "type_1",
    //         "name",
    //         "price",
    //         "base"
    //       ]
    //     },
    //     "where": {
    //       "game": {
    //         "@and": [
    //           {
    //             "team1_name": {
    //               "@like": {
    //                 "eng": this.teamsArray[0]
    //               }
    //             }
    //           },
    //           {
    //             "team2_name": {
    //               "@like": {
    //                 "eng": this.teamsArray[1]
    //               }
    //             }
    //           }
    //         ]
    //       },
    //       "market": {
    //         "type": {
    //           '@in': ['P1XP2','P1P2', '1X12X2','HalfTimeResult', 'SecondHalfResult', 'AsianHandicap', 'BothTeamsToScore', 'TotalGoals'],
    //         },
    //       }
    //     },
    //     "subscribe": true
    //   },
    //   "rid": "OHB-in-play-page"
    // });
    // this.websocket.getData().subscribe((data) => {
    //   if (data.data && data.data !== 'null' && data.data !== 'undefined') {
    //     if (data.rid === 'OHB-in-play-page') {
    //       this.tempObj = Object.assign({}, data.data.data.sport);
    //       this.subId = data.data.subid;
    //       this.inPlayWholeObject = Object.assign({}, this.prepareInPlayObject(JSON.parse(JSON.stringify(data.data.data.sport))));
    //     }
    //     if (data.data !== null && data.data[this.subId]) {
    //       this.tempObj  =  Object.assign({}, _.mergeWith(
    //         {},
    //         this.tempObj,
    //         data.data[this.subId].sport,
    //         (a,b)=>b === null ? a : undefined));
    //         this.inPlayWholeObject = Object.assign({}, this.prepareInPlayObject(JSON.parse(JSON.stringify(this.tempObj))));
    //     }
    //     console.log(this.inPlayWholeObject);
    //   }
    // })

  }

  decodeMatchTeams(url) {
    const arr = url.split('-vs-');
    return arr.map(e => e.replace(/-/g, ' '));
  }

  prepareInPlayObject(obj){
    let tempObj = {};
    tempObj = Object.assign({}, _.values(obj)[0]);
    tempObj['competition']  = _.values(tempObj['competition'])[0];
    tempObj['competition']['game']  = _.values(tempObj['competition']['game'])[0];
    tempObj['competition']['game']['market']  = _.values(tempObj['competition']['game']['market']);
    return  tempObj;
  }

  ngOnDestroy() {
    this.websocket.sendMessage({
      "command": "unsubscribe",
      "params": {
        "subid": this.subId
      }
    })
  }
}
