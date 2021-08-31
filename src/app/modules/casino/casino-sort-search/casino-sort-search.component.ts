import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { FormControl } from '@angular/forms';
import { debounceTime } from 'rxjs/operators';
import { HttpService } from '../../../shared/services/http/http.service';
import { environment } from '../../../../environments/environment.prod';
import { Subscription } from 'rxjs';
import { WindowService } from '../../../shared/services/window/window.service';
import { SubscriptionsService } from '../../../shared/services/subscriptions/subscriptions.service';
import { AuthService } from '../../../shared/services/auth/auth.service';
import { CasinoGameService } from '../../../shared/services/casino/casino-game.service';


@Component({
  selector: 'workspace-casino-sort-search',
  templateUrl: './casino-sort-search.component.html',
  styleUrls: ['./casino-sort-search.component.scss']
})
export class CasinoSortSearchComponent implements OnInit, OnChanges {
  showSearch: boolean;
  @Input() casinoCategories: any = [];
  selectedCategory: string;
  casinoSearch: FormControl = new FormControl('');
  isMobileCheck: Subscription;
  isMobile: boolean;
  noGames: boolean;
  gamesArray: any[];
  showResults: boolean;
  isLoggedIn: boolean;
  isLogged: Subscription;
  constructor(private http: HttpService,
              private rs: WindowService,
              private subscriptionsService: SubscriptionsService,
              private casino: CasinoGameService) {

    this.subscriptionsService.getLoadPopular().subscribe(data => {
      if(data){
        this.casino.getCasinoGames(true, true, '', 95);
      }
    })

    this.isMobileCheck = this.rs.onResize$.subscribe((data) => {
      if (data.width <= 997) {
        this.isMobile = true;
      } else {
        this.isMobile = false;
      }
    });
    this.casinoSearch.valueChanges.pipe(debounceTime(700)).subscribe(data => {
      if (data.length >= 3 && data !== '') {
        this.http.callRequest(`getGames?partner_id=${environment.settings.siteID}&offset=0&limit=10&search=${data}&is_mobile=${this.isMobile ? 1 : 0}`, 'POST', '', true)
          .subscribe(response => {
            if (response.games.length) {
              this.noGames = false;
              this.gamesArray = [...response.games];
              this.showResults = true;
            } else {
              this.gamesArray = [];
              this.noGames = true;
              this.showResults = true;
            }
          });
      } else if (data === '') {
        this.showResults = false;
      }
    });
    this.isLogged = this.subscriptionsService.getIsLoggedIn().subscribe((data)=>{
      this.isLoggedIn = data;
    })
  }

  ngOnInit(): void {
    if (this.rs.getScreenSize() <= 992) {
      this.isMobile = true;
    } else {
      this.isMobile = false;
    }
    this.selectedCategory = 'all';

  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['casinoCategories'] && changes['casinoCategories'].currentValue) {
      this.casinoCategories = [...changes['casinoCategories'].currentValue]
    }
  }

  selectCategory(cat) {
    cat.selected = true;
    this.casinoCategories.map(el => {
      if (el.id !== cat.id) {
        el.selected = false;
      }
    });
    this.selectedCategory = cat;
    if(!this.isMobile){
      this.casino.getCasinoGames(true, true, '', cat.id);
    } else {
      this.casino.setMobileCategory(cat.id);
    }
  }

  runGame(game) {
    if (!this.isLoggedIn){
      this.subscriptionsService.setShowLogin(true);
      this.showResults = false;
    } else {
      //console.log(game);
    }

  }


  maybeTheresResults() {
    if (this.casinoSearch.value !== '' && this.gamesArray.length) {
      this.showResults = true;
    }
  }
  showAdvancedSearch(){
    this.showSearch = true;
    this.subscriptionsService.setShowCasinoSearch(this.showSearch);
  }
}
