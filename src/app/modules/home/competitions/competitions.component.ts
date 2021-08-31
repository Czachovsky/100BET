import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ActivationEnd, Router } from "@angular/router";
import { filter, map } from "rxjs/operators";
import { WebsocketService } from "../../../shared/services/websocket/websocket.service";
import { Subscription } from 'rxjs';
import { SubscriptionsService } from '../../../shared/services/subscriptions/subscriptions.service';
import { AuthService } from '../../../shared/services/auth/auth.service';

@Component({
  selector: 'workspace-competitions',
  templateUrl: './competitions.component.html',
  styleUrls: ['./competitions.component.scss']
})
export class CompetitionsComponent implements OnInit {
  sportName: any  = [];
  openedTab: string;
  selectedSport: string;
  userLogged: boolean;
  isLogged: Subscription;
  constructor(private actRoute: ActivatedRoute,
              private router: Router,
              private websocket: WebsocketService,
              private subscriptionsService: SubscriptionsService,
              private auth: AuthService) {
                actRoute.params.subscribe(params => {
                  if (params.sport) {
                    this.selectedSport = params.sport;
                  }
                  if (params.tab) {
                    this.openedTab = params.tab;
                  }
                });
    this.isLogged = this.subscriptionsService.getIsLoggedIn().subscribe((data)=>{
      this.userLogged = data;
    })
  }

  ngOnInit(): void {
    this.userLogged = this.auth.isLoggedIn;
  }
  valueChanger(e){
    this.sportName = [{
      name: e,
      url: e
    }];
  }

  changeTab(whichOne){
    this.openedTab = whichOne;
    this.router.navigate([`../${whichOne}`], {relativeTo: this.actRoute, replaceUrl: true});
  }

  redirectStat() {
    const url = 'http://statistics.100100188.com/#/en/statistics/competition/' + this.actRoute.snapshot.params.competitionId + '/overview';
    window.open(url, "_blank");
  }
}
