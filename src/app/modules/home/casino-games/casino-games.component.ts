import {Component, OnInit} from '@angular/core';
import {JsonService} from "../../../shared/services/json/json.service";
import {WindowService} from "../../../shared/services/window/window.service";
import {debounceTime} from "rxjs/operators";
import {OwlOptions} from "ngx-owl-carousel-o";
import { FormControl } from '@angular/forms';
import { Observable,Subscription } from 'rxjs';
import { HttpService } from '../../../shared/services/http/http.service';
import { environment } from '../../../../environments/environment.prod';
import { Router } from '@angular/router';
import { AuthService } from '../../../shared/services/auth/auth.service';
import { SubscriptionsService } from '../../../shared/services/subscriptions/subscriptions.service';
import { CasinoGameService } from '../../../shared/services/casino/casino-game.service';

@Component({
  selector: 'workspace-casino-games',
  templateUrl: './casino-games.component.html',
  styleUrls: ['./casino-games.component.scss']
})
export class CasinoGamesComponent implements OnInit {
  gameToRun: any;
  runGameAfterLogin: boolean;
  casinoSearch: FormControl = new FormControl('');
  filteredGames: Observable<any[]>;
  gamesArray: any = [];
  searchedGames: any = [];
  isMobile: boolean;
  depositError: boolean;
  carouselOptions: OwlOptions = {
    loop: true,
    dots: false,
    nav: false,
    navText: ['<i class="fas fa-angle-left"></i>', '<i class="fas fa-angle-right"></i>'],
    autoplay: false,
    responsive: {
      0: {
        items: 2,
      },
      320: {
        items: 2.7,
      },
      420: {
        items: 3,
      },
      500: {
        items: 4
      },
      600: {
        items: 4.7,
      },
      800: {
        items: 6
      }
    }

  }
  noGames: boolean;
  showResults: boolean;
  isLogged: Subscription;
  constructor(private jsonService: JsonService,
              private rs: WindowService,
              private http: HttpService,
              private router: Router,
              private auth: AuthService,
              private subscriptionsService: SubscriptionsService,
              private casino: CasinoGameService) {
    this.isLogged = this.subscriptionsService.getIsLoggedIn().subscribe((data)=>{
        if(data && this.runGameAfterLogin){
          this.runGameAfterLogin = false;
          if(this.auth.userInfoObject['balance'] === 0 && this.gameToRun.runType === 'real'){
            this.depositError = true;
          } else {
            this.casino.setRunGameData(this.gameToRun);
            this.router.navigate(['casino']);
          }
        }
    })
  }

  ngOnInit(): void {
    if (this.rs.getScreenSize() <= 992) {
      this.isMobile = true;
    } else {
      this.isMobile = false;
    }
    this.http.callRequest(`getGames?partner_id=${environment.settings.siteID}&offset=0&limit=16`,'POST', '', true)
      .subscribe(response => {
        if(response.status === 'ok'){
            this.gamesArray = [...response.games];
        }
    })
    this.casinoSearch.valueChanges.pipe(debounceTime(700)).subscribe(data => {
      if (data.length >= 3 && data !== '') {
        this.http.callRequest(`getGames?partner_id=${environment.settings.siteID}&offset=0&limit=10&search=${data}&is_mobile=${this.isMobile ? 1 : 0}`, 'POST', '', true)
          .subscribe(response => {
            if (response.games.length) {
              this.noGames = false;
              this.searchedGames = [...response.games];
              this.showResults = true;
            } else {
              this.searchedGames = [];
              this.noGames = true;
              this.showResults = true;
            }
          })
      }
    })
    this.rs.onResize$.pipe(debounceTime(100)).subscribe(val => {
      if (val.width <= 992) {
        this.isMobile = true;
      } else {
        this.isMobile = false;
      }
    })

  }

  displayFn(game): string {
    return game && game.gameId ? game.gameId : '';
  }

  maybeTheresResults() {
    if (this.casinoSearch.value !== '' && this.searchedGames.length) {
      this.showResults = true;
    }
  }

  goToDepositPage(){
    this.router.navigate(['dashboard'], {queryParams: {'tab': 'deposit'}});
  }

  runGame(game, type){
    if (!this.auth.isLoggedIn){
      this.subscriptionsService.setShowLogin(true);
      this.runGameAfterLogin = true;
      this.gameToRun = game;
      this.gameToRun.runType = type;
    } else {
      if(this.auth.userInfoObject['balance'] === 0 && type === 'real'){
        this.depositError = true;
      } else {
        this.gameToRun = game;
        this.gameToRun.runType = type;
        this.casino.setRunGameData(this.gameToRun);
        this.router.navigate(['casino']);
      }

    }

  }
}
