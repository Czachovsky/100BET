import {Component, OnInit} from '@angular/core';
import {JsonService} from "../../../shared/services/json/json.service";
import {SubscriptionsService} from "../../../shared/services/subscriptions/subscriptions.service";
import {Pick} from '../../../shared/interfaces/pick'


@Component({
  selector: 'workspace-popular-bets',
  templateUrl: './popular-bets.component.html',
  styleUrls: ['./popular-bets.component.scss']
})
export class PopularBetsComponent implements OnInit {
  popularBetsArray: any;
  pickInterface: Pick;
  cartFromLocalStorage: any;

  constructor(private jsonService: JsonService, public subscriptionsService: SubscriptionsService) {
  }

  ngOnInit(): void {
    this.cartFromLocalStorage = JSON.parse(localStorage.getItem('100BetCart'))
    this.jsonService.getJson('popular-bets').subscribe(e => {
      this.popularBetsArray = this.makeChosenOrNot(e, this.cartFromLocalStorage);
    })
  }

  addBetToCart(e) {
    if (e.inCart === true) {
      e.inCart = false;
      this.subscriptionsService.triggerRemoveFromCart(e.id);
    } else {
      e.inCart = true;
      this.subscriptionsService.triggerAddPickToCart({
        pick: this.pickInterface = {
          id: e.id,
          date: e.popularBetDate,
          hour: e.popularBetHour,
          multiplier: e.popularBetMultiplier,
          teams: [
            {
              team: e.popularBetTeams[0].popularBetTeamName
            },
            {
              team: e.popularBetTeams[1].popularBetTeamName
            }
          ]
        }
      })
    }

  }

  makeChosenOrNot(firstArr, secondArr) {
    const tempArr1 = secondArr.map((e) => e.id)
    firstArr.filter((e) => {
      if (tempArr1.includes(e.id)) {
        e.inCart = true;
      }
    });
    return firstArr;
  }

  allPopularBets(e){
    e.preventDefault();
  }

}
