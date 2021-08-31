import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { WebsocketService } from '../../../shared/services/websocket/websocket.service';
import { SubscriptionsService } from '../../../shared/services/subscriptions/subscriptions.service';
import { BET_TYPES } from '../../../shared/bet-types';
import { Router } from '@angular/router';
import { WindowService } from '../../../shared/services/window/window.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'workspace-bet-history-settled',
  templateUrl: './bet-history-settled.component.html',
  styleUrls: ['./bet-history-settled.component.scss']
})
export class BetHistorySettledComponent implements OnInit, OnChanges {

  @Input() settledData: any;
  cashingOutIndex: any;
  websocketTimestamp: any;
  isMobile: boolean;
  isMobileCheck: Subscription;
  constructor(private websocket: WebsocketService, private subscriptionsService: SubscriptionsService, private router: Router,private rs: WindowService) {
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
          this.settledData[this.cashingOutIndex].cashingOut = false;
          this.settledData[this.cashingOutIndex].cashedOut = true;
          this.subscriptionsService.setIfNewBetHistory(true);
        }
      }
    })
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['settledData'] && changes['settledData'].currentValue) {
      this.settledData = changes['settledData'].currentValue;
      this.settledData.map((e,i) => {
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
    this.settledData[i]['calculatedCashout'] = price;
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
      this.settledData[index].showHistory = false;
    }
  }
  formatAmount(amount){
    if(amount.toString().split('.').length > 1){
      return amount.toFixed(2);
    } else {
      return amount
    }
  }
  watchLive(game) {
    localStorage.setItem('liveStreamUrl', game.events[0].game_id.toString());
    this.router.navigate([`/sportsbook/in-play/event-view/${game.events[0].sport_index}/${game.events[0].sport_id}/${game.events[0].game_id.toString()}`]);
  }
}
