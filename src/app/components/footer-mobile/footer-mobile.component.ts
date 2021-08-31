import { Component, EventEmitter, Inject, OnDestroy, OnInit, Output, Renderer2 } from '@angular/core';
import {
  ActivatedRoute,
  ActivationEnd,
  Router
} from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { SubscriptionsService } from '../../shared/services/subscriptions/subscriptions.service';
import { WebsocketService } from '../../shared/services/websocket/websocket.service';
import { filter, map } from 'rxjs/operators';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'workspace-footer-mobile',
  templateUrl: './footer-mobile.component.html',
  styleUrls: ['./footer-mobile.component.scss']
})
export class FooterMobileComponent implements OnInit, OnDestroy {
  @Output() toggleSideNav: EventEmitter<any> = new EventEmitter<any>();
  isLoggedIn:boolean;
  isLogged: Subscription;
  myBetsVisible: boolean;
  casinoFiltersVisible: boolean;
  openSideMenu = false;
  isCasino: boolean;
  showMyBets = false;
  constructor(
    private renderer: Renderer2,
    private subscriptionService: SubscriptionsService,
    private websocketService: WebsocketService,
    private translate: TranslateService,
    private router: Router,
    private ar: ActivatedRoute,
    @Inject(DOCUMENT) private document: Document
  ) {
    this.isLogged = this.subscriptionService.getIsLoggedIn().subscribe((data)=>{
      this.isLoggedIn = data ? true : false;
      if(data) {
        if (this.showMyBets) {
          this.showMyBets = false;
          this.myBetsVisible = false;
          setTimeout(() => {
            this.showMyBetsSection();
          }, 1000);
        }
      }
    })

    this.subscriptionService.getShowMobileMyBets().subscribe(data => {
      this.myBetsVisible = false;
    });

    this.router.events.pipe(
      filter((event) => event instanceof ActivationEnd))
      .subscribe((event) => {
        this.router.url.includes('casino') ? this.isCasino = true : this.isCasino = false;
      });


  }

  ngOnInit() {
    window.location.href.includes('casino') ? this.isCasino = true : this.isCasino = false;
    this.subscriptionService.getShowCasinoFilters().subscribe(data => {
      this.casinoFiltersVisible = data;
    })
  }

  ngOnDestroy() {
    this.isLogged.unsubscribe();
  }

  closeMyBets(){
    this.subscriptionService.setShowMobileMyBets(false);
    this.renderer.removeClass(document.body, 'noscroll');
  }

  showMyBetsSection() {
    if(!this.isLoggedIn){
      this.subscriptionService.setShowLogin(true);
      this.showMyBets = true;
    } else {
      this.myBetsVisible = !this.myBetsVisible;
      this.subscriptionService.setShowMobileMyBets(this.myBetsVisible);
      if(this.myBetsVisible){
        this.renderer.addClass(document.body, 'noscroll');
      } else {
        this.renderer.removeClass(document.body, 'noscroll');
      }
    }
  }
  showCasinoFilters(event){
    event.preventDefault();
    this.casinoFiltersVisible = !this.casinoFiltersVisible;
    this.subscriptionService.setShowCasinoFilters(this.casinoFiltersVisible);
    const element = this.document.getElementsByTagName('html');
    if(this.casinoFiltersVisible){
      this.renderer.addClass(document.body, 'noscroll');
      this.renderer.addClass(element[0], 'noscroll');
      this.renderer.addClass(document.body, 'casino-filters');
    } else {
      this.renderer.removeClass(document.body, 'noscroll');
      this.renderer.removeClass(element[0], 'noscroll');
      this.renderer.removeClass(document.body, 'casino-filters');
    }
  }
  toggle() {
    // this.openSideMenu = !this.openSideMenu;
    this.toggleSideNav.emit(true);
  }

  selectCasinoCategory(category, event){
    event.preventDefault();
    this.subscriptionService.setCasinoCategory(category);
  }

}
