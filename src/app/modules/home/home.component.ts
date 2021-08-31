import { Component, OnInit } from '@angular/core'
import {ActivatedRoute, ActivationStart, Event, NavigationEnd, Router} from "@angular/router";
import {filter, map} from "rxjs/operators";
import {Subscription} from "rxjs";
import {SubscriptionsService} from "../../shared/services/subscriptions/subscriptions.service";


@Component({
  selector: 'workspace-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  sportPageRoute: boolean;
  liveEventVisibility: Subscription;
  liveEventVisible: boolean;
  leftMenuVisibility: Subscription;
  leftMenuVisible: boolean;
  wrapperClass = '';
  showSearchSub: Subscription;
  showSearch: boolean;
  constructor( private router: Router, private subscriptionsService: SubscriptionsService, activatedRoute: ActivatedRoute) {
    this.leftMenuVisible = true;
    this.liveEventVisibility = this.subscriptionsService.getLiveEventVisible().subscribe(data => {
      this.liveEventVisible = data;
    })
    this.leftMenuVisibility = this.subscriptionsService.getLeftMenuVisible().subscribe(data => {
      this.leftMenuVisible = data;
    });
    router.events.subscribe((routerEvent: Event) => {
      this.checkRouterEvent(routerEvent);
    });
    activatedRoute.url.subscribe(() => {
      this.wrapperClass = activatedRoute.snapshot.firstChild.data['class'];
    });
    this.showSearchSub = this.subscriptionsService.getShowHomeSearch().subscribe(data => {
      if(data){
        this.showSearch = true;
      }
    })
  }

  checkRouterEvent(routerEvent: Event): void {
    if (routerEvent instanceof ActivationStart) {
      if (routerEvent.snapshot.data.class) {
        this.wrapperClass = routerEvent.snapshot.data['class'];
      } else {
        this.wrapperClass = '';
      }
    }
  }

  ngOnInit(): void {
    this.sportPageRoute = this.router.url.includes('home/sports') && !this.router.url.includes('competition');
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd), map((event: any) => event.url), )
      .subscribe((event) => {
        this.sportPageRoute = this.router.url.includes('home/sports');
      });
  }

}



