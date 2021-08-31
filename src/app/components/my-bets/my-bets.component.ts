import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import { WebsocketService } from '../../shared/services/websocket/websocket.service';
import { Subscription } from 'rxjs';
import { SubscriptionsService } from '../../shared/services/subscriptions/subscriptions.service';
import * as _ from 'lodash';


@Component({
  selector: 'workspace-my-bets',
  templateUrl: './my-bets.component.html',
  styleUrls: ['./my-bets.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MyBetsComponent implements OnInit {
 myBetsTab: number;
  logged: boolean;
  fromDate: any;
  toDate: any;
  ridTimestamp: any;
  myBetsArray: any = {};
  myBetsCashOut: any = [];
  myBetsLiveNow: any = [];
  myBetsUnsettled: any = [];
  myBetsSettled: any = [];
  isLoggedSubscription: Subscription;
  historyLoaded: boolean;
  constructor(private websocket: WebsocketService, private subscriptions: SubscriptionsService) {
      this.subscriptions.getIsLoggedIn().subscribe(data => {
        if(data){
         this.askForBetHistory();
        }
      })
  }

  ngOnInit(): void {
    this.ridTimestamp = new Date().getTime();
    this.toDate = new Date().getTime();
    this.fromDate = new Date().getTime() - 86400000;

    this.websocket.getData().subscribe(data => {
     if(data.data && data.data !== 'null' && data.data !== 'undefined'){
        if(data.rid === `bet-history-${this.ridTimestamp}`){
          this.freshMyBetsArray();
          this.historyLoaded = true;
        }
      }
    })
   this.myBetsTab = 0;

  }

  formatMyBetsArray(data, obj) {
    const tempObj = Object.assign({}, obj)
    data.map(e => {
      if (e.outcome === 0) {
        tempObj.unsettled.push({...e});
      } if (e.outcome !== 0) {
        tempObj.settled.push({...e});
      } if (e.cash_out && !e.is_gift) {
        tempObj.cashOut.push({...e});
      } if(e.events.filter(f => f.is_live === true).length > 0){
        tempObj.liveNow.push({...e});
      }
    });
    return tempObj;
  }

  freshMyBetsArray() {
    this.myBetsArray =  {
      'cashOut': [],
      'liveNow': [],
      'unsettled': [],
      'settled': []
    }
  }

  askForBetHistory(){
    this.websocket.sendMessage({
      'command': 'bet_history',
      'params': {
        'where': {
          'from_date': this.fromDate,
          'to_date': this.toDate,
          'with_pool_bets': true
        }
      },
      "rid": `bet-history-${this.ridTimestamp}`
    });
  }

}

