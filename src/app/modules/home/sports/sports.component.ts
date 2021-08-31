import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ActivationEnd, Router } from "@angular/router";
import { filter, map } from "rxjs/operators";
import { WebsocketService } from "../../../shared/services/websocket/websocket.service";
import { Subscription } from 'rxjs';
import { SubscriptionsService } from '../../../shared/services/subscriptions/subscriptions.service';
import { AuthService } from '../../../shared/services/auth/auth.service';

@Component({
  selector: 'workspace-sports',
  templateUrl: './sports.component.html',
  styleUrls: ['./sports.component.scss']
})
export class SportsComponent implements OnInit {
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
                });
    this.isLogged = this.subscriptionsService.getIsLoggedIn().subscribe((data)=>{
      this.userLogged = data;
    })
  }

  ngOnInit(): void {
    this.userLogged = this.auth.isLoggedIn;
    this.actRoute.queryParams.subscribe(data => {
      if (data.tab) {
        this.openedTab = data.tab;
      } else {
        this.openedTab = 'all';
      }
    })

  }
  valueChanger(e){
    this.sportName = [{
      name: e,
      url: e
    }];
  }

  changeTab(whichOne){
    this.openedTab = whichOne;
    this.router.navigate(['.'], {relativeTo: this.actRoute, queryParams: {"tab": whichOne}});
  }
}
