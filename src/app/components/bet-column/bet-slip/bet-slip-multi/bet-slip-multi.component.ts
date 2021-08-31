import {Component, Input, OnInit} from '@angular/core';
import {SubscriptionsService} from "../../../../shared/services/subscriptions/subscriptions.service";
import {BetSlipService} from "../../../../shared/services/bet-slip/bet-slip.service";
import { Subscription } from 'rxjs';
import { AnimationsService } from '../../../../shared/services/animations/animations.service';

@Component({
  selector: 'workspace-bet-slip-multi',
  templateUrl: './bet-slip-multi.component.html',
  styleUrls: ['./bet-slip-multi.component.scss']
})
export class BetSlipMultiComponent implements OnInit {

  @Input() pickedItems: any;
  betSlipChanges: Subscription;
  bankerEnabled: boolean;
  bankerTitle: string;
  notBanker: any;
  isBanker: any;
  constructor(private subsctiptionService: SubscriptionsService,
              private betSlipService: BetSlipService,
              private subscription: SubscriptionsService,
              private animations: AnimationsService) {
    this.betSlipChanges = this.subscription.getBetSlipChangesButDoNotSubscribeAgain().subscribe(data => {
      if(data){
        this.bankerEnabled = this.betSlipService.getBetSlipFromLocalStorage()['bankerEnabled'];
      }
    })
  }

  ngOnInit(): void {
    this.bankerEnabled = this.betSlipService.getBetSlipFromLocalStorage()['bankerEnabled'];
    this.bankerTitle = this.getBankerTitle();
  }

  removeThisItem(pickId, i) {
    this.pickedItems.splice(i, 1);
    this.betSlipService.changeSetSlipObject('picks', this.pickedItems);
    //a this.subsctiptionService.triggerBetSlipChanges(true);
    this.bankerTitle = this.getBankerTitle();
  }

  changeSelectState(e) {
    e.selected = !e.selected;
    this.betSlipService.changeSetSlipObject('picks', this.pickedItems);
  }
  whatShouldIDisplay(val, picked){
    if(val === 'W1'){
      return picked.team1Name;
    } else if(val === 'W2') {
      return picked.team2Name;
    } else {
      return picked.selectedOption;
    }
  }
  checkBanker(e, i){
      this.pickedItems[i].isBanker = !e.isBanker;
    this.betSlipService.changeSetSlipObject('picks', this.pickedItems);
    this.subsctiptionService.setSinglePickChanged(true);
   this.bankerTitle = this.getBankerTitle();
  }
  showMoreTrebles(e){
    this.animations.slideToggle(e);
  }

  getBankerTitle(){
    this.notBanker = 0;
    this.isBanker = 0;
    let indexB = 0;
    let indexNB = 0
    this.pickedItems.map(e => {
      if(e.isBanker){
        indexB++;
        this.isBanker++;
      } else {
        indexNB++;
        this.notBanker++;
      }
    })
    return `${indexB}B+${indexNB}/${indexNB}`;
  }

}
