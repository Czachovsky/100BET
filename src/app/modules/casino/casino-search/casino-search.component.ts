import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { debounceTime } from 'rxjs/operators';
import { environment } from '../../../../environments/environment.prod';
import { HttpService } from '../../../shared/services/http/http.service';
import { Subscription } from 'rxjs';
import { WindowService } from '../../../shared/services/window/window.service';
import  *  as _ from 'lodash';
import { AuthService } from '../../../shared/services/auth/auth.service';
import { CasinoGameService } from '../../../shared/services/casino/casino-game.service';
import { SubscriptionsService } from '../../../shared/services/subscriptions/subscriptions.service';
@Component({
  selector: 'workspace-casino-search',
  templateUrl: './casino-search.component.html',
  styleUrls: ['./casino-search.component.scss']
})
export class CasinoSearchComponent implements OnInit {
  @Output() runGameEmitter: EventEmitter<any> = new EventEmitter();
  isLoading: boolean;
  casinoSearch: FormControl = new FormControl('');
  dynamicSearch: boolean;
  dynamicSearchArr:any = [];
  nSearch: boolean;
  normalSearchArr:any = [];
  isMobileCheck: Subscription;
  isMobile: boolean;
  recentSearches: any = [];
  searchedPhrase: any;
  letDynamicSearch = true;
  constructor(private http: HttpService,
              private rs: WindowService,
              private auth: AuthService,
              private casino: CasinoGameService,
              private subscriptionsService: SubscriptionsService) {

    this.isMobileCheck = this.rs.onResize$.subscribe((data) => {
      if (data.width <= 997) {
        this.isMobile = true;
      } else {
        this.isMobile = false;
      }
    });

    this.casinoSearch.valueChanges.pipe(debounceTime(700)).subscribe(data => {
      if (data.length && data.length >= 3 && this.letDynamicSearch) {
        this.isLoading = true;
        this.dynamicSearch = true;
        this.searchDynamic(data);
      } else {
        this.getFromLocal();
        this.dynamicSearch = false;
        this.letDynamicSearch = true;
      }
    });
  }

  ngOnInit(): void {
    if (this.rs.getScreenSize() <= 992) {
      this.isMobile = true;
    } else {
      this.isMobile = false;
    }
    this.getFromLocal();
  }

  searchDynamic(data){
    this.http.callRequest(`getGames?partner_id=${environment.settings.siteID}&offset=0&limit=10&search=${data}&is_mobile=${this.isMobile ? 1 : 0}`, 'POST', '', true)
      .subscribe(response => {
        if(response.status === 'ok'){
          this.dynamicSearchArr = [...response.games];
          this.nSearch = false;
          this.isLoading = false;
        }
      })
  }

  getFromLocal() {
    this.recentSearches = [...JSON.parse(localStorage.getItem('100BetCasino'))['recent'].reverse()];
  }

  recentSearch(el){
    this.casinoSearch.patchValue(el.name);
    this.letDynamicSearch = false;
    this.normalSearch(el.name);
    this.searchedPhrase = el.name;
  }

  selectFromDynamic(el){
    this.casinoSearch.patchValue(el.name);
    this.letDynamicSearch = false;
    this.normalSearch(el.name);
    this.searchedPhrase = el.name;
  }

  groupSearchArr(arr){
      return _.groupBy(arr, game => game.cats[0].title);
  }

  normalSearch(data){
    this.http.callRequest(`getGames?partner_id=${environment.settings.siteID}&offset=0&limit=100&search=${data}&is_mobile=${this.isMobile ? 1 : 0}`, 'POST', '', true)
      .subscribe(response => {
        this.isLoading = false;
        if(response.status === 'ok' && response.games.length){
          this.letDynamicSearch = false;
          this.normalSearchArr = this.groupSearchArr(response.games);
          this.nSearch = true;
          this.addToRecent(data, 'phrase');
          this.dynamicSearch = false;
          setTimeout(() => {
            this.letDynamicSearch = true;
          }, 1000)
        }
      })
  }

  addToRecent(name, type){
    const casinoObj = JSON.parse(localStorage.getItem('100BetCasino'));
    if(!casinoObj.recent.filter(e => e.name === name).length) {
      casinoObj.recent.push({ type: type, name: name});
    } else if(casinoObj.recent.length >= 10){
      casinoObj.recent.shift();
    }
    localStorage.setItem('100BetCasino', JSON.stringify(casinoObj));
    this.getFromLocal();
  }

  hitEnter(){
    if(this.casinoSearch.value.length >= 3){
      this.isLoading = true;
      this.searchedPhrase = this.casinoSearch.value;
      this.normalSearch(this.searchedPhrase);
    }
  }

  runGame(game, type) {
    this.addToRecent(game.name, 'game');
    game.runType = type;
    this.runGameEmitter.emit(game);
   // this.subscriptionsService.setRunGameObj(game);

  }

}
