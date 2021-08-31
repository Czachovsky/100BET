import { Component, OnDestroy, OnInit, Renderer2, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../shared/services/auth/auth.service';
import { SubscriptionsService } from '../../shared/services/subscriptions/subscriptions.service';
import { Subscription } from 'rxjs';
import { WindowService } from '../../shared/services/window/window.service';
import { WebsocketService } from '../../shared/services/websocket/websocket.service';
import { PerfectScrollbarComponent } from 'ngx-perfect-scrollbar';

@Component({
  selector: 'workspace-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {
  buttonText = 'Button'
  dashboardSection: any;
  userInfo: any;
  isMobileCheck: Subscription;
  isMobile: boolean;
  clientClaimableDepositBonuses: Number = 0;
  setScroll = true;
  @ViewChild('perfectScroll') perfectScroll: PerfectScrollbarComponent;
  constructor(private router: Router,
              private actRoute: ActivatedRoute,
              private auth: AuthService,
              private subscripton: SubscriptionsService,
              private windowService: WindowService,
              private renderer: Renderer2,
              private websocket: WebsocketService) {

      this.actRoute.queryParams.subscribe(data => {
        if (data.tab) {
          this.dashboardSection = data.tab;
        } else {
          this.dashboardSection = 'details';
        }
      });
      this.subscripton.checkIfGetUserInfo().subscribe(data => {
        if(data) {
          this.userInfo = this.auth.userInfoObject;
        }
      })
      this.subscripton.getOpenModal().subscribe(res => {
        if(res){
          this.setScroll = false;
        } else {
          this.setScroll = true;
        }
      })
    this.getBonusCount();
    this.isMobileCheck = this.windowService.onResize$.subscribe((data) => {
      if (data.width <= 997) {
        this.isMobile = true;
      } else {
        this.isMobile = false;
      }
    });
  }

  ngOnDestroy() {
    this.isMobileCheck.unsubscribe();
    this.renderer.removeClass(document.body, 'OHBDashboard');
  }

  ngOnInit(): void {
    this.renderer.addClass(document.body, 'OHBDashboard');
    this.windowService.getScreenSize() <= 997 ? this.isMobile = true : this.isMobile = false;
    this.auth.GetUserInfo();
    this.userInfo = this.auth.userInfoObject;
    this.actRoute.queryParams.subscribe(data => {
      if (data.tab) {
        this.dashboardSection = data.tab;
      } else {
        this.dashboardSection = 'details';
      }
    })

    this.websocket.getData().subscribe(data => {
      if (data.data && data.data !== 'null' && data.data !== 'undefined') {
        if (data.rid === 'get_client_claimable_bonuses_count') {
          if(data.data.details) {
            this.clientClaimableDepositBonuses = data.data.details;
          }
        }
      }
    });
  }

  getBonusCount(){
    this.websocket.sendMessage({
      'command': 'get_client_claimable_bonuses_count',
      'params': {},
      "rid":"get_client_claimable_bonuses_count"
    });
  }

  goToDashboardSection(section){
    this.router.navigate(['.'], {relativeTo: this.actRoute, queryParams: {"tab": section}});
    if (this.perfectScroll) {
      this.perfectScroll.directiveRef.update();
      this.perfectScroll.directiveRef.scrollToTop(0, 1);
    }
  }
  checkForRefresh(e){
    if(e){
      this.auth.GetUserInfo();
    }
  }
}
