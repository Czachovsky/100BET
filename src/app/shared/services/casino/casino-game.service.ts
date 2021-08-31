import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment.prod';
import { HttpService } from '../http/http.service';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';
import * as _ from 'lodash';
@Injectable({
  providedIn: 'root'
})
export class CasinoGameService {
  runGameData: any;
  gamesLeft: any;
  gameOffset: number;
  gameLimit: number;
  gamesArr:  any = [];
  mobileFiterProvider: any;
  mobileFilterCategory: any;
  tempArr: any = [];
  constructor(private http: HttpService, private subscriptions: SubscriptionsService) {
    this.gameOffset = 0;
    this.gameLimit = 10;
  }

  freshStart(){
    this.gameOffset = 0;
    this.gameLimit = 10;
    this.gamesArr = [];
  }

  setMobileCategory(e){
    this.mobileFilterCategory = e;
  }

  setMobileProvider(e){
    this.mobileFiterProvider = e;
  }
  getCasinoGames(freshArr, resetOffset, provider?, category?){
    if(resetOffset){
      this.gameOffset = 0;
      this.gameLimit = 10;
    }
    if(!provider && JSON.parse(localStorage.getItem('100BetCasino'))['provider'] !== ''){
      provider = JSON.parse(localStorage.getItem('100BetCasino'))['provider'];
    }
    if(!category && JSON.parse(localStorage.getItem('100BetCasino'))['category'] !== ''){
      category = JSON.parse(localStorage.getItem('100BetCasino'))['category'];
    }
    const url =  `getGames?partner_id=${environment.settings.siteID}&offset=${this.gameOffset}&limit=${this.gameLimit}${provider && provider !== 'all_providers' ? `&provider=${provider}` : ''}${category && category !== 'all_categories'? `&category=${category}`:''}`;
    this.http.callRequest(url, 'POST', '', true).subscribe(response => {
      if(response.status === 'ok'){
        this.gamesLeft = response.total_count - this.gameLimit;
        const _t = [...response.games];
        _t.map(e => e.loaded = false);
        freshArr ? this.gamesArr = [...response.games] : this.gamesArr = [...this.gamesArr.concat(response.games)]
        this.gameOffset = this.gameOffset + 10;
        this.gameLimit = this.gameLimit + 10;
        if(provider){
          this.setToLocalStorage('provider', provider);
        }
        if(category){
          this.setToLocalStorage('category', category);
        }
        this.tempArr = [...this.gamesArr];
        const casinoObj = JSON.parse(localStorage.getItem('100BetCasino'))['favouriteGames'];
        this.gamesArr.map(e => {
          if (casinoObj.includes(e.id)) {
            e.favouriteGame = true;
          } else {
            e.favouriteGame = false;
          }
        });
        this.gamesArr = [..._.sortBy(this.gamesArr, [o => !o.favouriteGame])];
        this.subscriptions.sendCasinoGamesObj(this.gamesArr);
        if(Number(response.total_count) > 10 && this.gamesLeft > 0){
          this.subscriptions.setShowMoreGames(true);
        } else {
          this.subscriptions.setShowMoreGames(false);
        }
        console.log(this.gamesArr);
      } else {
        console.error('error', response);
      }
    })
  }

  updateCasinoGameObj(arr){
    this.gamesArr = [...arr];
  }

  get casinoGameObj(){
    return this.gamesArr;
  }

  setToLocalStorage(what, data) {
    const obj = JSON.parse(localStorage.getItem('100BetCasino'));
    if (what === 'provider') {
      obj.provider = data;
    } else if (what === 'category') {
      obj.category = data;
    }
    localStorage.setItem('100BetCasino', JSON.stringify(obj));
  }

  setRunGameData(data){
    this.runGameData = data;
  }

  get getRunGameData(){
    return this.runGameData;
  }

}
