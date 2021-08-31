import { Component, OnInit } from '@angular/core';
import {SubscriptionsService} from "../../../shared/services/subscriptions/subscriptions.service";
import { Subscription } from 'rxjs';
import { AuthService } from '../../../shared/services/auth/auth.service';
import { WindowService } from '../../../shared/services/window/window.service';

@Component({
  selector: 'workspace-sports-page',
  templateUrl: './sports-page.component.html',
  styleUrls: ['./sports-page.component.scss']
})
export class SportsPageComponent implements OnInit {
  isLogged: Subscription;
  userLogged: boolean;
  isMobileCheck: Subscription;
  isMobile: boolean;
  constructor(private subscriptionsService: SubscriptionsService, private auth: AuthService, private windowService: WindowService) {
    // this.subscriptionsService.setLiveEventVisible(false);
    // this.subscriptionsService.setLeftMenuVisible(true);
    this.isLogged = this.subscriptionsService.getIsLoggedIn().subscribe((data)=>{
      this.userLogged = data;
    })
    this.isMobileCheck = this.windowService.onResize$.subscribe((data) => {
      if (data.width <= 992) {
        this.isMobile = true;
      } else {
        this.isMobile = false;
      }
    });
    if (this.windowService.getScreenSize() <= 992) {
      this.isMobile = true;
    }
  }

  ngOnInit(): void {
    this.windowService.getScreenSize() <= 997 ? this.isMobile = true : this.isMobile = false;
    this.userLogged = this.auth.isLoggedIn;
  }

}
