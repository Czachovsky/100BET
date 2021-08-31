import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { WebsocketService } from '../../../shared/services/websocket/websocket.service';
import { SubscriptionsService } from '../../../shared/services/subscriptions/subscriptions.service';
import { BET_TYPES } from '../../../shared/bet-types';
import { Router } from '@angular/router';
import { WindowService } from '../../../shared/services/window/window.service';
import { Subscription } from 'rxjs';
import { HttpService } from '../../../shared/services/http/http.service';
declare var videojs: any;
@Component({
  selector: 'workspace-bet-history-unsettled',
  templateUrl: './bet-history-unsettled.component.html',
  styleUrls: ['./bet-history-unsettled.component.scss']
})
export class BetHistoryUnsettledComponent implements OnInit, OnChanges, OnDestroy {

  @Input() unsettledData: any;
  cashingOutIndex: any;
  websocketTimestamp: any;
  isMobile: boolean;
  isMobileCheck: Subscription;
  showMobileMovie:boolean;
  player: any;
  constructor(private websocket: WebsocketService, private subscriptionsService: SubscriptionsService, private router: Router,private rs: WindowService,private ht: HttpService) {
    this.isMobileCheck = this.rs.onResize$.subscribe((data) => {
      if (data.width <= 997) {
        this.isMobile = true;
      } else {
        this.isMobile = false;
      }
    });
  }

  ngOnInit(): void {
    this.rs.getScreenSize() <= 997 ? this.isMobile = true : this.isMobile = false;
    this.websocket.getData().subscribe(data => {
      if (data.data && data.data !== 'null' && data.data !== 'undefined') {
        if (data.rid === `cashingOut${this.websocketTimestamp}`) {
          this.unsettledData[this.cashingOutIndex].cashingOut = false;
          this.unsettledData[this.cashingOutIndex].cashedOut = true;
          this.subscriptionsService.setIfNewBetHistory(true);
        }
      }
    })
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['unsettledData'] && changes['unsettledData'].currentValue) {
      this.unsettledData = changes['unsettledData'].currentValue;
      this.unsettledData.map((e,i) => {
        if(i <= 4){
          e.eventsExpanded = true;
        }
      })
    }
  }

  getBetType(id){
    return BET_TYPES[id];
  }

  expandBet(e) {
    e.eventsExpanded = !e.eventsExpanded;
    if (!e.score_loaded) {
      const x = [];
      e.events.forEach(el => {
        if (el.outcome !== 0) {
          x.push(el.game_id);
        } else {
          el.result = 0;
        }
      });
      if(x.length){
        //  this.sendForMatchScores(x, e.id);
      } else {
        e.score_loaded = true;
      }
    }
    if(e.showMobileEvent){
      e.showMobileEvent = false;
      if (this.player) {
        this.player.dispose();
        this.player = undefined;
      }
    }
  }

  sendForMatchScores(gameId, id){
    this.websocket.sendMessage({
      "command": "get_match_scores",
      "params": {
        "match_id_list": gameId
      },
      "rid": `match_res-${id}`
    })
  }

  todayOrTomorrow(timestamp) {
    const d = new Date(timestamp);
    if (new Date().getDate() !== d.getDate()) {
      return d;
    }
  }

  trackById(index:number, el:any): number {
    return el.id;
  }

  calculateCashOutAmount(e,  i){
    let price = e;
    if (price >= 100){
      price = Math.round(price);
    } else if (price >= 10) {
      price = Math.round(price * 10) / 10;
    } else {
      price = Math.round(price * 100) / 100;
    }
    this.unsettledData[i]['calculatedCashout'] = price;
  }

  triggerCashOut(bet, full, partial, price, id, index){
    if(bet.outcome !== 5){
      this.cashingOutIndex = index;
      bet.cashingOut = true;
      this.websocketTimestamp = new Date().getTime();
      let message;
      if(partial || price !== partial){
        message = {
          "command": "cashout",
          "params": {
            "bet_id": id,
            "price": price,
            "mode": 2,
            "partial_price": partial
          },
          "rid": `cashingOut${this.websocketTimestamp}`
        }
      } else {
        message = {
          "command": "cashout",
          "params": {
            "bet_id": id,
            "price": price,
            "mode": 2
          },
          "rid": `cashingOut${this.websocketTimestamp}`
        }
      }

      this.websocket.sendMessage(message);
    }
  }

  getCloseSetttings(val, index){
    index.showCashOutSettings = !val;
  }
  showCashoutHistory(bet){
    bet.showHistory = !bet.showHistory;
  }
  getCloseHistory(e, index){
    if(e){
      this.unsettledData[index].showHistory = false;
    }
  }
  formatAmount(amount){
    if(amount.toString().split('.').length > 1){
      return amount.toFixed(2);
    } else {
      return amount
    }
  }
  watchLive(game, index) {
    if (this.isMobile) {
      game.liveEventLoading = true;
      this.unsettledData.map((e, i) => {
        if (i !== index) {
          e.showMobileEvent = false;
        } else {
          e.showMobileEvent = true;
        }
      });
      this.ht.callRequest(`stream/getbybc?bcEventId=${game.events[0].game_id}&session_id=${localStorage.getItem('sessionId')}&locale=${localStorage.getItem('pageLanguage')  === 'zh' ?  'cn' : 'en'}`, 'GET').subscribe(response => {
        game.liveEventLoading = true;
        if(response.result) {
          game.streamUrl = response.streamUrl;
          setTimeout(() => {
            this.player = videojs('_liveStream', {
              sources: {
                src: game.streamUrl,
                type: "application/x-mpegURL"
              }
            });
            this.player.play();
          }, 1000);
          setTimeout(() =>{ game.liveEventLoading = false },1500)
        } else {
          game.liveEventLoading = false;
          game.noStream = true;
        }
      });
    } else {
      localStorage.setItem('liveStreamUrl', game.events[0].game_id.toString());
      this.router.navigate([`/sportsbook/in-play/event-view/${game.events[0].sport_index}/${game.events[0].sport_id}/${game.events[0].game_id.toString()}`]);
    }
  }
  closePlayer(){
    this.player.dispose();
    this.player = undefined;
    this.unsettledData.map(e => e.showMobileEvent = false);
  }
  ngOnDestroy() {
    if(this.player){
      this.player.dispose();
      this.player = undefined;
      this.unsettledData.map(e => e.showMobileEvent = false);
    }
  }
}
