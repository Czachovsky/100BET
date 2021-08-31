import { Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import {HttpService} from "../../shared/services/http/http.service";
import {FormControl} from "@angular/forms";
import {debounceTime, takeUntil} from "rxjs/operators";
import {AnimationsService} from "../../shared/services/animations/animations.service";
import {SubscriptionsService} from "../../shared/services/subscriptions/subscriptions.service";
import { JsonService } from "../../shared/services/json/json.service";
import { TranslateService } from "@ngx-translate/core";
import { Subject, Subscription } from "rxjs";
import { WebsocketService } from "../../shared/services/websocket/websocket.service";
import * as _ from 'lodash';
import { Router } from "@angular/router";
import { UtilityService } from '../../shared/services/utility.service';
@Component({
  selector: 'workspace-left-column-nav',
  templateUrl: './left-column-nav.component.html',
  styleUrls: ['./left-column-nav.component.scss']
})
export class LeftColumnNavComponent implements OnInit, OnDestroy {
  @Input() activeSportId: number;
  @Input() gameId: number;
  leftSideMenu: any = [];
  leftSideMenuV2: any = [];
  icons: any = [];
  sideMenu: any = [];
  leftColumnSearch: FormControl = new FormControl('');
  languageChange: Subscription;
  @ViewChild('childrenNode', {static: false}) childrenNode: ElementRef;
  @ViewChild('grandChildrenNode', {static: false}) grandChildrenNode: ElementRef;
  actualTimeStamp: any;
  subId:any;
  bodySubId:any;
  tempObj: object = {};
  tempBodyObj: object = {};
  favouritesObj: any = {};
  showCompetitions = false;
  isMarketView = false;
  isInPlay = false;
  selectedGame;
  seconds;
  liveInterval;
  objectKeys = Object.keys;
  destroy$: Subject<boolean> = new Subject<boolean>();
  index = 0;
  firstLoad = true;
  refreshList = false;
  bcEventIDs = [];
  liveStreamIds: Array<number> = [];
  private visibilityChangeCallback: () => void;
  visibilityChnage: boolean;

  constructor(private http: HttpService,
              private animationService: AnimationsService,
              public subscriptionService: SubscriptionsService,
              public jsonService: JsonService, public utility: UtilityService,
              private translate: TranslateService,
              private websocket: WebsocketService,
              private router: Router) {
    this.isMarketView = router.url.indexOf('/sportsbook/markets/') !== -1;
    this.isInPlay = router.url.indexOf('/sportsbook/in-play') !== -1;
    this.showCompetitions = this.isInPlay;

    this.languageChange = this.subscriptionService.getLanguage().subscribe(lang => {
      if(lang){
        this.getData();
        this.jsonService.getJson(`left-navigation-${lang}`).subscribe(data => {
          this.leftSideMenu = data;
        })
      }
    });

    this.jsonService.getJson(`sports-icons`).subscribe(data => {
      this.icons = data;
    });

    this.leftColumnSearch.valueChanges.pipe(debounceTime(700)).subscribe(data => {
      if (data !== '') {
        console.log('Searching for:', data);
      }
    })

  }

  ngOnInit(): void {
    this.seconds = this.utility.getSeconds();
    setInterval(() => {
      this.seconds = this.utility.getSeconds();
    }, 1000);
    this.prepareFavObject();
    this.jsonService.getJson(`left-navigation-${this.translate.currentLang}`).subscribe(data => {
      this.leftSideMenu = data;
      this.getData();
    });

    this.visibilityChangeCallback = () => this.handleVisibleState();
    document.addEventListener('visibilitychange', this.visibilityChangeCallback, true);
  }

  handleVisibleState() {
    if (document.visibilityState) {
      if (this.visibilityChnage) {
        this.visibilityChnage = false;
        this.leftSideMenuV2.forEach(menu => {
          if (menu.childrenNode && menu.childrenNode.length) {
            menu.childrenNode.forEach(child => {
              if (child.showMatches) {
                this.getInPlayData(child.id);
              }
            });
          } else {
            if (menu.showMatches) {
              this.getInPlayData(menu.id);
            }
          }
        });
      } else {
        this.visibilityChnage = true;
      }
    }
  }

  getData() {
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
          "game": this.getMessage()
        },
        "subscribe": false
      },
      "rid": 'OHB-leftColumnNav'
    });
    this.websocket.getData().pipe(takeUntil(this.destroy$)).subscribe((data) => {
      if(data.data && data.data !== 'null' && data.data !== 'undefined'){
        if (data.rid === 'OHB-leftColumnNav') {
          this.subId = data.data.subid;
          this.tempObj = Object.assign({},data.data.data.sport);
          this.leftSideMenuV2 = this.manageList();
          this.sideMenu = this.manageList(true);
          // this.leftSideMenuV2 = [...this.prepareMenu(Object.assign({}, _.orderBy(_.values(data.data.data.sport), 'order', 'asc')))];
          // this.sideMenu = _.cloneDeep([...this.prepareMenu(Object.assign({},_.values(data.data.data.sport)), true)]);
          if (this.showCompetitions && !this.activeSportId) {
            this.activeSportId = this.leftSideMenuV2[this.index].id;
          }
          this.showMatches();
        }
        if(data.rid === 'OHB-sidenav-data' && this.selectedGame) {
          this.bodySubId = data.data.subid;
          if (data.data && data.data !== 'null' && data.data !== 'undefined' && typeof data.data === 'object') {
            this.tempBodyObj = Object.assign({}, _.cloneDeep(data.data.data.sport[this.selectedGame.id]));
            this.modifyObj(this.tempBodyObj);
          }
        }
        if (data.data !== null && data.data[this.bodySubId]) {
          this.tempBodyObj = Object.assign({}, _.mergeWith(
            {},
            this.tempBodyObj,
            data.data[this.bodySubId].sport[this.selectedGame.id],
            (a,b)=>b === null ? a : undefined));
          this.modifyObj(this.tempBodyObj, true);
        }
      }

    });
  }

  getIds() {
    let arr = this.leftSideMenuV2.filter(x => x.showMatches);
    for (const item of this.leftSideMenuV2) {
      if (item.extend) {
        arr = [...arr, ...item.childrenNode.filter(x => x.showMatches)];
      }
    }
    let bcEventIDs = [];
    for (const item of arr) {
      if (item.liveMatches.length) {
        const ids = item.liveMatches.reduce((r, {game}) => {
          game.forEach(e => r.push(e.id.toString()));
          return r;
        }, []);
        bcEventIDs = [...bcEventIDs, ...ids];
      }
    }
    this.bcEventIDs = bcEventIDs;
  }

  getStreamInfo() {
    this.getIds();
    this.http.callRequest('ksport/getstreamstatesome', 'POST', {bcEventIDs: this.bcEventIDs}).subscribe(res => {
      if (res.result) {
        Object.keys(res.data).forEach(key => {
          if (res.data[key].streamState) {
            if (!this.liveStreamIds.includes(Number(key))) {
              this.liveStreamIds.push(Number(key));
            }
          } else if (this.liveStreamIds.includes(Number(key)) && !res.data[key].streamState) {
            const idx = this.liveStreamIds.findIndex(x => x === Number(key));
            if (idx !== -1) {
              this.liveStreamIds.splice(idx, 1);
            }
          }
        });
      }
    });
  }

  manageList(origin?: boolean) {
    let sports = _.cloneDeep(this.tempObj);
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
      "icon": "assets/images/icons/sports/more.png",
      "extend": false,
      "childrenNode": [...sportsArr.filter((x) => x.order > 800 && x.order < 851)]
    };
    leftNav.push(moreSport);

    if (!origin) {
      leftNav = [...favourites, ...leftNav];
    }
    leftNav = leftNav.filter(x => !x.childrenNode || (x.childrenNode && x.childrenNode.length));
    return leftNav;
  }

  modifyObj(data, isUpdated?: boolean) {
    let idx = this.leftSideMenuV2.findIndex(x => x.id === this.selectedGame.id);
    if (idx !== -1 && data && data.region) {
      const regions = JSON.parse(JSON.stringify(data.region));
      this.getCompetitions(regions, this.leftSideMenuV2[idx], isUpdated);
    } else {
      this.leftSideMenuV2.forEach(menu => {
        if (menu.childrenNode && menu.childrenNode.length) {
          const pId = menu.childrenNode.findIndex(item => item.id === this.selectedGame.id);
          if (pId !== -1 && data && data.region) {
            idx = pId;
            const regions = JSON.parse(JSON.stringify(data.region));
            this.getCompetitions(regions, menu.childrenNode[idx], isUpdated);
          }
        }
      });
      if (this.showCompetitions && idx === -1) {
        this.index++;
        this.activeSportId = this.leftSideMenuV2[this.index].id;
        this.showMatches();
      }
    }
  }

  getCompetitions(data, sport, isUpdated?: boolean) {
    const regions = _.values(data);
    let competitions = [];
    for(const region of regions) {
      for (const key in region.competition) {
        if (region.competition.hasOwnProperty(key)) {
          region.competition[key]['region'] = {
            id: region.id,
            name: region.name,
            order: region.order,
            alias: region.alias
          };
          region.competition[key].game = _.values(region.competition[key].game);
          const promoted = region.competition[key].game.filter(x => x.promoted).sort((a, b) => {
            return <any>new Date(a.start_ts * 1000) - <any>new Date(b.start_ts * 1000);
          });
          const notPromoted = region.competition[key].game.filter(x => !x.promoted).sort((a, b) => {
            return <any>new Date(a.start_ts * 1000) - <any>new Date(b.start_ts * 1000);
          });
          region.competition[key].game = [...promoted, ...notPromoted];
        }
      }
      competitions = [...competitions, ..._.values(region.competition)];
    }
    const favorites = competitions.filter(x => x.favorite).sort((a, b) => {
      return a.order - b.order;
    });
    const notfavorites = competitions.filter(x => !x.favorite).sort((a, b) => {
      return a.order - b.order;
    });
    sport.liveMatches = [...favorites, ...notfavorites];
    if (this.showCompetitions && !isUpdated) {
      if (this.activeSportId && this.gameId) {
        this.leftSideMenuV2.forEach(menu => {
          if (menu.childrenNode && menu.childrenNode.length) {
            const pId = menu.childrenNode.findIndex(item => item.id === this.activeSportId);
            if (pId !== -1) {
              this.expandElements(menu);
              this.selectGame(this.gameId, menu.childrenNode[pId]);
            }
          } else {
            if (menu.id === this.activeSportId) {
              this.selectGame(this.gameId, menu);
            }
          }
        });
        // const idx = this.leftSideMenuV2.findIndex(x => x.id === this.activeSportId);
        // this.selectGame(this.gameId, this.leftSideMenuV2[idx]);
      } else {
        this.selectGame(sport.liveMatches[0].game[0].id, this.leftSideMenuV2[this.index]);
      }
    }
    if (!isUpdated && !this.firstLoad) {
      if (this.refreshList) {
        this.refreshList = false;
        this.getLiveStatus();
      }
    }
    if (this.firstLoad) {
      this.firstLoad = false;
      this.getLiveStatus();
    }
  }

  getLiveStatus() {
    if (this.liveInterval) {
      clearInterval(this.liveInterval);
    }
    this.getStreamInfo();
    this.liveInterval = setInterval(() => {
      this.getStreamInfo();
    }, 60 * 1000);
  }

  showMatches() {
    if (this.activeSportId) {
      this.leftSideMenuV2.forEach(menu => {
        if (menu.childrenNode && menu.childrenNode.length) {
          const pId = menu.childrenNode.findIndex(item => item.id === this.activeSportId);
          if (pId !== -1) {
            this.goToSportPage(menu.childrenNode[pId]);
          }
        } else {
          if (menu.id === this.activeSportId) {
            this.goToSportPage(menu);
          }
        }
      });
    }
  }

  expandElements(item){
    if(item.childrenNode && item.childrenNode.length){
      item.extend = !item.extend;
    }
  }
  selectGame(gameId, sport) {
    if (this.showCompetitions) {
      if (this.isMarketView) {
        this.router.navigate([`/sportsbook/markets/${sport.alias}/${sport.id}/${gameId}`]);
      } else if(this.isInPlay) {
        this.router.navigate([`/sportsbook/in-play/event-view/${sport.alias}/${sport.id}/${gameId}`]);
      }
    }
  }

  onChangeGame(gameId, sport) {
    this.selectGame(gameId, sport);
  }

  prepareMenu(arr, origin?: boolean){
    const tempObj = Object.assign({}, arr);
    let tempMenu = [];
    const temp = [];
    let menu = [];
    menu = [...this.leftSideMenu];
    tempMenu = [..._.values(tempObj)]

    tempMenu = tempMenu.sort((a, b) => a.order - b.order);

    tempMenu.map((e,i)=>{
      e['favourite'] = !!this.favouritesObj['sport'].filter(item => item === e.id).length;
    });

    tempMenu.map((e, i) => {
      const idx = this.icons.findIndex(x => x.alias === e.alias);
      e['icon'] = idx !== -1 ? this.icons[idx]['icon'] : 'assets/images/icons/sports/soccer.png';
    });

    if (!origin) {
      tempMenu = [..._.sortBy(tempMenu, [o => !o.favourite])]
    }
    if (tempMenu.length > 10 || !this.showCompetitions) {
      if (this.showCompetitions) {
        menu = [menu[0]];
      }
      tempMenu.map((e,i) => {
        if(i > 9){
          temp.push(e);
        }
      })
      tempMenu = tempMenu.slice(0, 10);
      menu.map((e)=>{
        if(e.alias === 'showmore'){
          e.childrenNode = temp;
        }
      });
      return _.concat(tempMenu, menu);
    } else {
      return tempMenu;
    }
  }

  goToFixtureList(e) {
    console.log(e);
  }

  getInPlayData(sportId){
    this.websocket.sendMessage({"command":"get","params":{"source":"betting","what":{"sport":["id","name","alias","order"],"competition":[],"game":[["id","start_ts","team1_name","team2_name","type","info",'promoted',"events_count","events","markets_count","is_started","is_blocked","stats","tv_type","video_id","video_id2","video_id3","partner_video_id","is_stat_available","game_number","game_info"]],"market":[],"region":[],"event":["name","id","price","type","order","base"]},"where":{"sport":{"id":sportId,"type": {'@nin': [1, 4],},},"game":{"type":1},"market":{"type":{"@in":["P1P2","P1XP2","MatchResult","MatchWinner","1X12X2","BothTeamsToScore","DrawNoBet","EvenOddTotal","MatchTotal","OverUnder","HalfTimeAsianHandicap"]}}},"subscribe":true},"rid":"OHB-sidenav-data"})
  }

  getCurrentTime(info) {
    if (!info.match_time) {
      info.match_time = info.current_game_time;
      info.match_time = info.match_time.split(':')[0];
    }
    if (this.seconds === '00' && !info.timeUpdated) {
      info.timeUpdated = true;
      info.match_time = parseInt(info.match_time, 0) + 1;
    }
    if (info.timeUpdated && this.seconds === '01') {
      info.timeUpdated = false;
    }
    return info.match_time;
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
    this.websocket.sendMessage({
        "command": "unsubscribe",
        "params": {
          "subid": this.subId
        }
      }
    );
    this.activeSportId = undefined;
    this.gameId = undefined;
    this.languageChange.unsubscribe();
    clearInterval(this.liveInterval);
    document.removeEventListener('visibilitychange', this.visibilityChangeCallback, true);
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

  getMessage(): any {
    if (!this.showCompetitions) {
      return {
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
      };
    } else {
      return {
        "type": 1
      };
    }
  }

  goToSportPage(e, refreshList?: boolean){
    if (e.childrenNode) {
      return;
    }
    this.selectedGame = e;
    if (this.showCompetitions && !e.childrenNode) {
      e.showMatches = !e.showMatches;
      if (e.showMatches) {
        if (refreshList) {
          this.refreshList = true;
        }
        this.getInPlayData(e.id);
      }
    } else {
      if(e.alias !== 'showmore') {
        const alias = e.alias.split(/(?=[A-Z])/).join('-').toLowerCase();
        this.router.navigate(['/sportsbook/'+alias.toLowerCase()]);
      }
    }
  }
}




