import { Component, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { WebsocketService } from '../../shared/services/websocket/websocket.service';
import { SubscriptionsService } from '../../shared/services/subscriptions/subscriptions.service';
import { interval, Subscription } from 'rxjs';
import { AuthService } from '../../shared/services/auth/auth.service';
import { HttpService } from '../../shared/services/http/http.service';
import { Router } from '@angular/router';

@Component({
  selector: 'workspace-bet-history',
  templateUrl: './bet-history.component.html',
  styleUrls: ['./bet-history.component.scss']
})
export class BetHistoryComponent implements OnInit {
  liveEventsChecker: Subscription;
  myBetsLoading: boolean;
  showMobile: boolean;
  showMobileSubscription: Subscription;
  getNewBetHistorySubscription: Subscription;
  languageChange: Subscription;
  myBetsTab = 0;
  fromDate: any;
  toDate: any;
  ridTimestamp: any;
  test: any;
  isLoggedIn: boolean;
  liveEventsArray: any = [];
  liveStreamIds: any = [];
  tempMyBetsObj = [];
  myBetsObject = {
    'cashOut': [],
    'liveNow': [],
    'unsettled': [],
    'settled': [],
    'all': []
  };

  constructor(private websocket: WebsocketService,
              private subscriptions: SubscriptionsService,
              private auth: AuthService,
              private renderer: Renderer2,
              private httpS: HttpService,
              private router: Router) {

    // this.subscriptions.getIsLoggedIn().subscribe(data => {
    //     if(data){
    //       this.getData();
    //     }
    // })

    this.showMobileSubscription = this.subscriptions.getShowMobileMyBets().subscribe(data => {
      this.showMobile = data;
    });
    this.subscriptions.getIsLoggedIn().subscribe(data => {
      if (data) {
        setTimeout(() => {
          this.sendForBetHistory();
          this.isLoggedIn = true;
        }, 500);
      }
    });
    this.subscriptions.getIfBetComplete().subscribe(data => {
      if (data) {
        setTimeout(() => {
          this.sendForBetHistory();
        }, 1500);
      }
    });

    this.getNewBetHistorySubscription = this.subscriptions.getIfNewBetHistory().subscribe(data => {
      if (data) {
        this.sendForBetHistory();

      }
    });
  }

  ngOnInit(): void {
    if (this.auth.isLoggedIn) {
      setTimeout(() => {
        this.getData();
      }, 500);
    }
    this.websocket.getData().subscribe(data => {
      if (data.data && data.data !== 'null' && data.data !== 'undefined') {
        if (data.rid === `bet-history-${this.ridTimestamp}`) {
          if (data.data.result === '-2455') {
            console.log('waiting....');
          } else {
            if (data.data?.bets?.length) {
              this.myBetsObject = {
                'cashOut': [],
                'liveNow': [],
                'unsettled': [],
                'settled': [],
                'all': []
              };
              this.tempMyBetsObj = [...data.data.bets];
              this.myBetsObject = this.formatMyBetsObject(data.data.bets, this.myBetsObject);
              if (this.liveEventsChecker) {
                this.liveEventsChecker.unsubscribe();
              }
              const bcEventIDs = data.data.bets.map(x => x.events[0].game_id.toString());
              this.lookinForLiveStream(bcEventIDs);
            }
            setTimeout(() => {
              this.myBetsLoading = false;
            }, 500);
          }
        }
        if (data.rid.includes('match_res-')) {
          const match_res = [...data.data.details];
          const id = data.rid.split('-')[1];
          this.tempMyBetsObj.filter(e => e.id === Number(id))[0]['events'].map(el => {
            match_res.map(f => {
              if (f.match_id === el.game_id) {
                el.score = f.score;
              }
            });

          });
          this.tempMyBetsObj.filter(e => e.id === Number(id))[0]['score_loaded'] = true;
          this.myBetsObject = {
            'cashOut': [],
            'liveNow': [],
            'unsettled': [],
            'settled': [],
            'all': []
          };
          this.myBetsObject = this.formatMyBetsObject(this.tempMyBetsObj, this.myBetsObject);
        }
      }
    });
  }

  getData() {
    this.isLoggedIn = true;
    this.sendForBetHistory();
  }

  closeMyBets() {
    this.showMobile = false;
    this.subscriptions.setShowMobileMyBets(false);
    this.renderer.removeClass(document.body, 'noscroll');
  }

  formatMyBetsObject(data, obj) {
    const tempObj = Object.assign({}, obj);
    data.map(e => {
      e.isLive = !!this.liveStreamIds.includes(e.events[0].game_id.toString());
      e.eventsExpanded = false;
      e.scoreLoaded = false;
      e.showCashOutSettings = false;
      e.cashingOut = false;
      e.cashedOut = false;
      e.confirmCashout = false;
      if (e.outcome === 0) {
        tempObj.unsettled.push({ ...e });
      }
      if (e.outcome !== 0) {
        tempObj.settled.push({ ...e });
      }
      if (e.cash_out && !e.is_gift) {
        tempObj.cashOut.push({ ...e });
      }
      if (e.events.filter(f => f.is_live === true && f.outcome === 0).length > 0) {
        tempObj.liveNow.push({ ...e });
      }
      tempObj.all.push({ ...e });
    });
    return tempObj;
  }

  sendForBetHistory() {
    this.myBetsLoading = true;
    this.toDate = Math.round(new Date().getTime() / 1000);
    this.fromDate = Math.round((new Date().getTime() - 86400000) / 1000);
    this.ridTimestamp = new Date().getTime();
    this.websocket.sendMessage({
      'command': 'bet_history',
      'params': {
        'where': {
          'from_date': this.fromDate,
          'to_date': this.toDate,
          'with_pool_bets': true
        }
      },
      'rid': `bet-history-${this.ridTimestamp}`
    });
  }

  lookinForLiveStream(bcEventIDs) {
    this.httpS.callRequest('ksport/getstreamstatesome', 'POST', { bcEventIDs }).subscribe(res => {
      console.log(res);
      if (res.result) {
        this.myBetsObject = {
          'cashOut': [],
          'liveNow': [],
          'unsettled': [],
          'settled': [],
          'all': []
        };
        this.liveStreamIds = [];
        this.liveEventsArray = Object.assign({}, res.data);
        Object.keys(res.data).forEach(key => {
          if (res.data[key].streamState) {
            this.liveStreamIds.push(key)
          }
        })
        this.myBetsObject = this.formatMyBetsObject(this.tempMyBetsObj, this.myBetsObject);
      }
    });
  }

}
