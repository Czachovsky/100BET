import { KeyValue } from '@angular/common';
import { Component, EventEmitter, HostListener, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { Subscription } from 'rxjs';
import { BetSlipService } from '../../shared/services/bet-slip/bet-slip.service';
import { SubscriptionsService } from '../../shared/services/subscriptions/subscriptions.service';
import { OddsService } from '../../shared/services/odds/odds.service';

@Component({
  selector: 'workspace-sports-odds-listing',
  templateUrl: './sports-odds-listing.component.html',
  styleUrls: ['./sports-odds-listing.component.scss']
})
export class SportsOddsListingComponent implements OnInit, OnChanges {
  @Input() data: any;
  @Input() headers: any;
  @Input() startTime: string;
  @Output() redirect: EventEmitter<any> = new EventEmitter<any>();
  innerWidth;
  picksInBetslip: any = [];
  betSlipCartChanged: Subscription;
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.innerWidth = window.innerWidth;
  }
  constructor(
    private betSlipService: BetSlipService,
    public subscriptionsService: SubscriptionsService,
    public os: OddsService) {
    this.picksInBetslip = [...this.betSlipService.getArrayOfPicks()];
    this.betSlipCartChanged = this.subscriptionsService
    .getBetSlipChanges()
    .subscribe((data) => {
      if (data) {
        this.picksInBetslip = [...this.betSlipService.getArrayOfPicks()];
      }
    });
  }

  ngOnInit(): void {
    this.innerWidth = window.innerWidth;
  }

  orderAsc = (akv: KeyValue<string, any>, bkv: KeyValue<string, any>): number => {
    const a = akv.value.order;
    const b = bkv.value.order;
    return a > b ? 1 : (b > a ? -1 : 0);
  };

  ngOnChanges(changes: SimpleChanges) {
    if (changes) {
      if (changes.data && changes.data.currentValue) {
        this.data = changes.data.currentValue;
      }
      if (changes.headers && changes.headers.currentValue) {
        this.headers = changes.headers.currentValue;
      }
    }
  }

  todayOrTomorrow(timestamp) {
    const d = new Date(timestamp);
    if (new Date().getDate() !== d.getDate()) {
      return d;
    }
  }

  getWidth() {
    return (this.headers.length * 152) + 'px';
  }

  getButtonWidth() {
    return 100 / this.headers.length + '%';
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
        stake: '1.00',
        selected: true,
        isConflict: false,
        isBanker: false
      });
    }
    this.picksInBetslip = [...this.betSlipService.getArrayOfPicks()];
  }

  shouldHasPickedClass(id) {
    return this.picksInBetslip.includes(id);
  }

  redirectTo(match) {
    this.redirect.emit(match);
  }

}
