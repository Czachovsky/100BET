import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { WebsocketService } from '../../shared/services/websocket/websocket.service';
import * as _ from 'lodash';
import { JsonService } from '../../shared/services/json/json.service';
import { SubscriptionsService } from '../../shared/services/subscriptions/subscriptions.service';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';

@Component({
  selector: 'workspace-sidenav-mobile',
  templateUrl: './sidenav-mobile.component.html',
  styleUrls: ['./sidenav-mobile.component.scss']
})
export class SidenavMobileComponent implements OnInit {
  @Output() toggleSideNav: EventEmitter<any> = new EventEmitter<any>();
  selectedCategory = 'Sports';
  subId;
  leftSideMenu: any = [];
  leftSideMenuV2: any = [];
  icons: any = [];
  sideMenu: any = [];
  tempObj: object = {};
  favouritesObj: any = {};
  sportsList = [];
  inPlayList = [];

  constructor(
    private translate: TranslateService,
    public subscriptionService: SubscriptionsService,
    private websocket: WebsocketService,
    private router: Router,
    public jsonService: JsonService) {

    this.subscriptionService.getLanguage().subscribe(lang => {
      if(lang){
        this.sendMessage();
        this.jsonService.getJson(`left-navigation-${lang}`).subscribe(data => {
          this.leftSideMenu = data;
        })
      }
    });
    this.jsonService.getJson(`sports-icons`).subscribe(data => {
      this.icons = data;
    });
  }

  ngOnInit(): void {
    this.prepareFavObject();
    this.jsonService.getJson(`left-navigation-${this.translate.currentLang}`).subscribe(data => {
      this.leftSideMenu = data;
      this.sendMessage();
    });
    this.websocket.getData().subscribe((data) => {
      if(data.data && data.data !== 'null' && data.data !== 'undefined'){
        if (data.rid === 'OHB-sidenav-mobile') {
          this.sportsList = this.manageList(Object.assign({},_.values(data.data.data.sport)));
          this.sideMenu = _.cloneDeep(this.manageList(Object.assign({},_.values(data.data.data.sport)), true));
          this.leftSideMenuV2 = this.sportsList;
        }
        if (data.rid === 'OHB-sidenav-inPlay-mobile') {
          this.subId = data.data.subid;
          this.tempObj = Object.assign({},data.data.data.sport);
          this.inPlayList = this.manageList(Object.assign({},_.values(data.data.data.sport)));
        }
        if (data.data !== null && data.data[this.subId]) {
          this.tempObj = Object.assign({}, _.mergeWith(
            {},
            this.tempObj,
            data.data[this.subId].sport,
            (a,b)=>b === null ? a : undefined));
          this.inPlayList = [...this.manageList(Object.assign({},_.values(this.tempObj)))];
        }
      }
    });
  }

  isMobileSafari() {
    return navigator.userAgent.match(/(iPod|iPhone|iPad)/) && navigator.userAgent.match(/Safari/);
  }

  sendMessage() {
    this.websocket.sendMessage({
      "command": "get",
      "params": {
        "source": "betting",
        "what": {
          "sport": [
            "name",
            "order",
            "alias",
            "id"
          ]
        },
        "where": {
          sport: {
            type: {
              '@nin': [1, 4],
            },
          },
          "game": {
            "@or": [
              {
                "type": {
                  "@in": [
                    0,
                    2
                  ]
                }
              },
              {
                "visible_in_prematch": 1,
                "type": 1
              }
            ]
          }
        },
        "subscribe": false
      },
      "rid": 'OHB-sidenav-mobile'
    });
    this.websocket.sendMessage({
      "command": "get",
      "params": {
        "source": "betting",
        "what": {
          "sport": [
            "name",
            "order",
            "alias",
            "id"
          ],
          "game": '@count'
        },
        "where": {
          sport: {
            type: {
              '@nin': [1, 4],
            },
          },
          "game": {
            type: 1
          }
        },
        "subscribe": true
      },
      "rid": 'OHB-sidenav-inPlay-mobile'
    });
  }

  manageList(sportsObj, origin?: boolean) {
    let sports = _.cloneDeep(sportsObj);
    sports = Object.keys(sports)
    .filter(key => sports[key].order > 500)
    .reduce((obj, key) => {
      return {
        ...obj,
        [key]: sports[key]
      };
    }, {});

    let sportsArr: any[] = _.orderBy(_.values(sports), 'order', 'asc');
    sportsArr.map((e)=>{
      e['favourite'] = !!this.favouritesObj['sport'].filter(item => item === e.id).length;
    });

    sportsArr.map((e) => {
      const idx = this.icons.findIndex(x => x.alias === e.alias);
      e['icon'] = idx !== -1 ? this.icons[idx]['icon'] : 'assets/images/icons/sports/soccer.png';
    });

    let favourites = [];

    if (!origin) {
      favourites = sportsArr.filter(x => x.favourite);
      sportsArr = sportsArr.filter(x => !x.favourite);
    }

    let leftNav: any[] = [...sportsArr.filter((x) => x.order < 551)];
    const eSports  = {
      "name": this.translate.instant("nav.eSports"),
      "alias": "eSports",
      "extend": false,
      "childrenNode": [...sportsArr.filter((x) => x.order > 550 && x.order < 601)]
    };
    leftNav.push(eSports);
    leftNav = [...leftNav, ...sportsArr.filter((x) => x.order > 600 && x.order < 651)];
    const boxing  = {
      "name": this.translate.instant("nav.boxing"),
      "alias": "Boxing",
      "icon": "assets/images/icons/sports/boxing.png",
      "extend": false,
      "childrenNode": [...sportsArr.filter((x) => x.order > 650 && x.order < 701)]
    };
    leftNav.push(boxing);
    leftNav = [...leftNav, ...sportsArr.filter((x) => x.order > 700 && x.order < 751)];
    const winterSports  = {
      "name": this.translate.instant("nav.winterSports"),
      "alias": "WinterSports",
      "icon": "assets/images/icons/sports/winter.png",
      "extend": false,
      "childrenNode": [...sportsArr.filter((x) => x.order > 750 && x.order < 801)]
    };
    leftNav.push(winterSports);
    const moreSport  = {
      "name": this.translate.instant("nav.moreSports"),
      "alias": "showMore",
      "extend": false,
      "icon": "assets/images/icons/sports/more.png",
      "childrenNode": [...sportsArr.filter((x) => x.order > 800 && x.order < 851)]
    };
    leftNav.push(moreSport);

    if (!origin) {
      leftNav = [...favourites, ...leftNav];
    }
    leftNav = leftNav.filter(x => !x.childrenNode || (x.childrenNode && x.childrenNode.length));
    return leftNav;
  }

  expandElements(item){
    if(item.childrenNode && item.childrenNode.length){
      item.extend = !item.extend;
    }
  }

  addToFavourite(el, parent?: any) {
    let favourites = this.leftSideMenuV2.filter(x => x.favourite);
    if (!el.favourite) {
      favourites.push(el);
      if (parent) {
        const pId = parent.childrenNode.findIndex(item => item.id === el.id);
        parent.childrenNode.splice(pId, 1);
      }
      let unFavourits = this.leftSideMenuV2.filter(x => x.id !== el.id && !x.favourite);
      unFavourits = this.reOrderArr(unFavourits, this.sideMenu);
      this.leftSideMenuV2 = [...favourites, ...unFavourits];
      el.favourite = true;
      this.favouritesObj['sport'].push(el.id);
    } else {
      const idx = this.sideMenu.findIndex(item => item.id === el.id);
      if (idx !== -1) {
        let unFavourits = this.leftSideMenuV2.filter(x => !x.favourite);
        unFavourits.push(el);
        favourites = favourites.filter(x => x.id !== el.id);
        unFavourits = this.reOrderArr(unFavourits, this.sideMenu);
        this.leftSideMenuV2 = [...favourites, ...unFavourits];
      } else {
        this.sideMenu.forEach(menu => {
          if (menu.childrenNode && menu.childrenNode.length) {
            const pId = menu.childrenNode.findIndex(item => item.id === el.id);
            if (pId !== -1) {
              this.leftSideMenuV2.forEach(smenu => {
                if (smenu.childrenNode && smenu.childrenNode.length && smenu.alias === menu.alias) {
                  smenu.childrenNode.splice(pId, 0, el);
                  smenu.childrenNode = this.reOrderArr(smenu.childrenNode, menu.childrenNode);
                  this.leftSideMenuV2 = this.leftSideMenuV2.filter(x => x.id !== el.id);
                }
              });
            }
          }
        });
      }
      el.favourite = false;
      this.favouritesObj['sport'] = [...this.favouritesObj['sport'].filter(item => item !== el.id)];
    }
    localStorage.setItem('100BetFavourites', JSON.stringify(this.favouritesObj));
    this.sportsList = _.cloneDeep(this.leftSideMenuV2);
  }

  reOrderArr(arr, originOrderArr) {
    const c = originOrderArr.reduce((r, a, i) => {
      r[a.alias] = i;
      return r;
    }, {});
    arr.sort((x, y) => {
      return c[x.alias] - c[y.alias];
    });
    return arr;
  }

  prepareFavObject() {
    if (localStorage.getItem('100BetFavourites') && JSON.parse(localStorage.getItem('100BetFavourites'))['sport'].length) {
      this.favouritesObj = Object.assign({}, JSON.parse(localStorage.getItem('100BetFavourites')))
    } else {
      localStorage.setItem('100BetFavourites', JSON.stringify({ "sport": [] }));
      this.favouritesObj = Object.assign({}, JSON.parse(localStorage.getItem('100BetFavourites')))
    }
  }

  changeTab(category) {
    this.selectedCategory = category;
    this.leftSideMenuV2 = [];
    if (category === 'Sports') {
      this.leftSideMenuV2 = this.sportsList;
    } else {
      this.leftSideMenuV2 = this.inPlayList;
    }
  }

  goToSportPage(e){
    if (e.alias !== 'showmore' && !e.childrenNode) {
      this.toggleSideNav.emit(true);
      const alias = e.alias.split(/(?=[A-Z])/).join('-').toLowerCase();
      this.router.navigate(['/sportsbook/'+alias.toLowerCase()]);
    }
  }

}
