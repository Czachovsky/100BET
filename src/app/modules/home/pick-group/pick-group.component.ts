import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { BetSlipService } from '../../../shared/services/bet-slip/bet-slip.service';
import { Subscription } from 'rxjs';
import { SubscriptionsService } from '../../../shared/services/subscriptions/subscriptions.service';

@Component({
  selector: 'workspace-pick-group',
  templateUrl: './pick-group.component.html',
  styleUrls: ['./pick-group.component.scss']
})
export class PickGroupComponent implements OnInit, OnChanges {

  @Input() rowOrColumn: string;
  @Input() pickData: any;
  @Input() marketData: any;
  picksInBetslip: any = [];
  betSlipCartChanged: Subscription;
  constructor(private betSlipService: BetSlipService,
              private subscriptionsService: SubscriptionsService) {
    this.picksInBetslip = [...this.betSlipService.getArrayOfPicks()];
    this.betSlipCartChanged = this.subscriptionsService.getBetSlipChanges().subscribe((data) => {
        if (data) {
          this.picksInBetslip = [...this.betSlipService.getArrayOfPicks()];
        }
      });
  }

  ngOnInit(): void {
  }

  shouldHasPickedClass(inCart, id) {
    return this.picksInBetslip.includes(id);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['pickData'] && changes['pickData'].currentValue) {
        console.log('.currentValue', changes['pickData'].currentValue)
    }
  }

  removeOrAddToBetSlip(){

  }

}
