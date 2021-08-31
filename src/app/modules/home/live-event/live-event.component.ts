import { Component, ElementRef, Inject, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { UtilityService } from '../../../shared/services/utility.service';
import { WebsocketService } from '../../../shared/services/websocket/websocket.service';
import { SubscriptionsService } from '../../../shared/services/subscriptions/subscriptions.service';
import { AuthService } from '../../../shared/services/auth/auth.service';
import * as _ from 'lodash';
import * as moment from 'moment';
import { HttpService } from '../../../shared/services/http/http.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { JsonService } from '../../../shared/services/json/json.service';
import { Router } from '@angular/router';
import { GameInfo } from '../../../components/markets/markets.component';
import { GAME_STATES } from '../../../shared/game-states';
import { DOCUMENT } from '@angular/common';
declare var videojs: any;
declare var SportAnimation: any;

@Component({
  selector: 'workspace-live-event',
  templateUrl: './live-event.component.html',
  styleUrls: ['./live-event.component.scss']
})
export class LiveEventComponent implements OnInit, OnChanges, OnDestroy {
  @Input() gameInfo: GameInfo;
  icons = [];
  liveEventObj: any;
  liveEvent;
  subId;
  inPlaySubId;
  inPlaytempBodyObj: any;
  inPlaySports = [];
  liveStreamIds = [];
  bcEventIDs = [];
  streamUrl;
  activeTab = 'court';
  player;
  state: boolean;
  selected;
  liveInterval;
  isEventView = false;
  language: string;
  destroy$: Subject<boolean> = new Subject<boolean>();
  @ViewChild('video') videoElement: ElementRef;
  showLogin: boolean;
  isLoading: boolean;
  sportAnimation;

  constructor(
    @Inject(DOCUMENT) private document: any,
    private router: Router,
    private websocket: WebsocketService,
    private httpSer: HttpService,
    public subscriptionsService: SubscriptionsService,
    public auth: AuthService,
    public jsonService: JsonService,
    public utility: UtilityService) {
      this.language = localStorage.getItem('pageLanguage');
    this.isEventView = router.url.indexOf('/sportsbook/in-play/event-view') !== -1;
    this.utility.liveStream$.pipe(takeUntil(this.destroy$)).subscribe(game => {
      if (game && game.id) {
        this.unsubscribeOldReq();
        this.getLiveStremUrl(game);
        this.gameInfo.gameId = game.id;
        this.sendMessage();
        utility.selectGameForLiveStream(null);
      }
    });
    this.utility.animation$.pipe(takeUntil(this.destroy$)).subscribe(game => {
      if (game && game.id) {
        if (this.player) {
          this.player.dispose();
          this.player = undefined;
        }
        this.unsubscribeOldReq();
        this.gameInfo.gameId = game.id;
        this.sendMessage();
        this.activeTab = 'court';
        this.setAnimation();
        utility.selectGameForAnimation(null);
      }
    });
    this.subscriptionsService.checkIfGetUserInfo().subscribe(login => {
      if (login && this.showLogin) {
        this.showLogin = false;
        this.playLiveStream();
      }
    });
    this.jsonService.getJson(`sports-icons`).pipe(takeUntil(this.destroy$)).subscribe((data: any) => {
      if (data && data.length) {
        this.icons = data;
      }
    });
  }

  ngOnInit(): void {
    this.getInPlayData();
    this.websocket.getData().pipe(takeUntil(this.destroy$)).subscribe((data) => {
      if (data.data && data.data !== 'null' && data.data !== 'undefined') {
        if (data.rid === 'OHB-in-play-live-events' &&
            this.gameInfo && data.data.data.sport &&
            data.data.data.sport[this.gameInfo.sportId] &&
            data.data.data.sport[this.gameInfo.sportId].region
        ) {
          this.subId = data.data.subid;
          this.liveEventObj = _.cloneDeep(data.data.data.sport[this.gameInfo.sportId]);
          const sport = _.cloneDeep(data.data.data.sport[this.gameInfo.sportId]);
          if (sport && sport.region) {
            const region = _.values(sport.region)[0];
            const competition = _.values(region.competition)[0];
            this.liveEvent = competition.game[this.gameInfo.gameId];
            if (!this.utility.pinnedVideo) {
              this.selected = this.liveEvent;
            }
            if (!this.isLoading) {
              this.getLiveStremUrl(this.liveEvent);
            }
            if (this.activeTab === 'court' && this.sportAnimation) {
              this.startAnimation();
            }
          }
        }
      }
      if (data.data !== null && data.data[this.subId] && this.gameInfo) {
        this.liveEventObj = Object.assign({}, _.mergeWith(
          {},
          this.liveEventObj,
          data.data[this.subId].sport[this.gameInfo.sportId],
          (a,b)=>b === null ? a : undefined));
        const sport = _.cloneDeep(this.liveEventObj);
        if (sport && sport.region) {
          const region = _.values(sport.region)[0];
          const competition = _.values(region.competition)[0];
          this.liveEvent = competition.game[this.gameInfo.gameId];
          this.startAnimation();
        }
      }
      if(data.rid === 'OHB-live-event-dropdown') {
        if (data.data && data.data.data.sport && Object.keys(data.data.data.sport).length) {
          this.inPlaySubId = data.data.subid;
          this.inPlaytempBodyObj = JSON.parse(JSON.stringify(data.data.data.sport));
          this.modifyInplayData();
          setTimeout(() => {
            this.getLiveStatus();
          }, 100);
        }
      }
      if (data.data !== null && data.data[this.inPlaySubId] && this.gameInfo) {
        this.inPlaytempBodyObj = Object.assign({}, _.mergeWith(
          {},
          this.inPlaytempBodyObj,
          data.data[this.inPlaySubId].sport,
          (a,b)=>b === null ? a : undefined));
        this.modifyInplayData();
      }
    });
  }

  modifyInplayData() {
    const sports = _.cloneDeep(_.values(this.inPlaytempBodyObj));
    const dropDownList = [];
    for(const sport of sports) {
      const regions = _.cloneDeep(_.values(sport.region));
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
            const promoted = region.competition[key].game.filter(x => x && x.promoted).sort((a, b) => {
              return <any>new Date(a.start_ts * 1000) - <any>new Date(b.start_ts * 1000);
            });
            const notPromoted = region.competition[key].game.filter(x => x && !x.promoted).sort((a, b) => {
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
      competitions = [...favorites, ...notfavorites];
      const obj: any = {
        name: sport.name,
        alias: sport.alias,
        id: sport.id,
        competitions
      };
      const idx = this.icons.findIndex(x => x.alias === sport.alias);
      obj.icon = idx !== -1 ? this.icons[idx]['icon'] : 'assets/images/icons/sports/soccer.png';
      dropDownList.push(obj);
    }
    this.inPlaySports = dropDownList;
    this.setPinnedSelected();
  }

  getInPlayData(){
    this.websocket.sendMessage({"command":"get","params":{"source":"betting","what":{"sport":["id","name","alias","order"],"competition":[],"game":[["id","start_ts","team1_name","team2_name","type","info",'promoted',"events_count","events","markets_count","is_started","is_blocked","stats","tv_type","video_id","video_id2","video_id3","partner_video_id","is_stat_available","game_number","game_info"]],"market":[],"region":[],"event":["name","id","price","type","order","base"]},"where":{"game":{"type":1},"market":{"type":{"@in":["P1P2","P1XP2","MatchResult","MatchWinner","1X12X2","BothTeamsToScore","DrawNoBet","EvenOddTotal","MatchTotal","OverUnder","HalfTimeAsianHandicap"]}}},"subscribe":false},"rid":"OHB-live-event-dropdown"})
  }

  playLiveStream() {
    this.destroyAnimation();
    this.activeTab = 'live';
    if (!this.auth.isLoggedIn) {
      return;
    }
    if (this.player && this.player.id_) {
      this.player.dispose();
      this.reInitPlayer();
    } else {
      const element = document.getElementById('liveStream');
      if (!element) {
        this.reInitPlayer();
      }
    }
    setTimeout(() => {
      if (this.streamUrl) {
        this.player = videojs('liveStream', {
          sources: {
            src: this.streamUrl,
            type: "application/x-mpegURL"
          }
        });
        document.getElementById('liveabc').click();
        this.player.play();
      }
    }, 1000);
  }

  reInitPlayer() {
    if (document.getElementById('live-video')) {
      document.getElementById('live-video').innerHTML = '';
      document.getElementById('live-video').innerHTML += '<video id="liveStream" class="video-js live-stream vjs-default-skin vjs-big-play-centered vjs-big-play-button" controls data-setup="{}"data-res="auto" ></video>';
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
    if (this.player) {
      this.player.dispose();
      this.player = undefined;
    }
  }

  sendMessage() {
    if (this.gameInfo && this.gameInfo.gameId) {
      this.websocket.sendMessage({
        "command": "get",
        "params": {
          "source": "betting",
          "what": {
            "sport": ["id", "name", "alias"],
            "region": ["id", "alias", "name"],
            "competition": ["id", "name"],
            "game": ["id", "markets_count", "start_ts", "is_started", "is_blocked", "team1_id", "team2_id", "game_number", "text_info", "is_stat_available", "match_length", "type", "info", "stats", "team1_name", "team2_name", "tv_info", "add_info_name", "showInfo", "live_events", "last_event", "add_info"],
            "market": ["name", "type", "id", "base", "express_id", "order", "group_name", "group_order", "cashout", "group_id", "col_count", "point_sequence"],
            "event": ["id", "order", "type_1", "name", "price", "base"]
          },
          "where": {
            "game": {
              "id": this.gameInfo.gameId
            },
            "sport": {
              "alias": this.gameInfo.alias
            }
          },
          "subscribe": true
        },
        "rid": "OHB-in-play-live-events"
      });
    }
  }

  unsubscribeOldReq() {
    this.websocket.sendMessage({
      command: 'unsubscribe',
      params: {
        subid: this.subId,
      },
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes && changes.gameInfo && changes.gameInfo.currentValue) {
      this.gameInfo = changes.gameInfo.currentValue;
      this.destroyAnimation();
      if (this.player) {
        this.player.dispose();
        this.player = undefined;
      }
      this.sendMessage();
    }
  }

  checkState() {
    this.state = !this.state;
  }

  clickedOutside() {
    this.state = false;
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

  getFieldImageMobile() {
    if (this.gameInfo) {
      const idx = this.icons.findIndex(x => x.alias === this.gameInfo.alias);
      return idx !== -1 && this.icons[idx]['mobileField'] ? this.icons[idx]['mobileField'] : 'assets/images/fields/mobile/Mask Group 64@3x.png';
    } else {
      return 'assets/images/fields/mobile/Mask Group 64@3x.png';
    }
  }

  getStreamInfo() {
    this.getIds();
    this.httpSer.callRequest('ksport/getstreamstatesome', 'POST', {bcEventIDs: this.bcEventIDs}).subscribe(res => {
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

  getIds() {
    const arr = this.inPlaySports.filter(x => x.competitions);
    let bcEventIDs = [];
    for (const item of arr) {
      if (item.competitions.length) {
        const ids = item.competitions.reduce((r, {game}) => {
          game.forEach(e => r.push(e.id.toString()));
          return r;
        }, []);
        bcEventIDs = [...bcEventIDs, ...ids];
      }
    }
    this.bcEventIDs = bcEventIDs;
  }

  selectOption(game, sport){
    this.state = false;
    this.selected = game;
    this.utility.pinnedVideo = undefined;
    this.getLiveStremUrl(game, sport);
    // this.router.navigate([`/sportsbook/in-play/event-view/${this.gameInfo.alias}/${this.gameInfo.sportId}/${this.selected.id}`]);
  }

  getLiveStremUrl(game, option?: any) {
    if (this.utility.pinnedVideo) {
      if (!this.streamUrl) {
        this.streamUrl = this.utility.pinnedVideo.url;
      }
      setTimeout(() => {
        this.playLiveStream();
      }, 100);
    } else {
      if (game) {
        this.isLoading = true;
        this.httpSer.callRequest(`stream/getbybc?bcEventId=${game.id}&session_id=${localStorage.getItem('sessionId')}&locale=${localStorage.getItem('pageLanguage')  === 'zh' ?  'cn' : 'en'}`,'GET')
        .pipe(takeUntil(this.destroy$)).subscribe(data => {
          this.isLoading = false;
          if(data.result) {
            this.streamUrl = data.streamUrl;
            if (this.activeTab === 'live' || localStorage.getItem('liveStreamUrl')) {
              localStorage.removeItem('liveStreamUrl');
              this.playLiveStream();
            } else if  (this.activeTab === 'court') {
              this.setAnimation();
            }
          } else {
            this.handleError();
          }
        }, () => {
          this.isLoading = false;
          this.handleError();
        });
      }
    }
  }

  handleError() {
    this.streamUrl = undefined;
    if (localStorage.getItem('liveStreamUrl')) {
      localStorage.removeItem('liveStreamUrl');
      this.activeTab = 'live';
      if (this.player) {
        this.player.dispose();
        this.player = undefined;
      }
    } else {
      this.activeTab = 'court';
      this.setAnimation();
    }
  }

  pinVideo() {
    if (this.utility.pinnedVideo) {
      this.utility.pinnedVideo = undefined;
      this.getLiveStremUrl(this.liveEvent);
      this.selectOption(this.liveEvent, null);
    } else {
      if (this.streamUrl) {
        this.utility.pinnedVideo = {
          gameId: this.selected.id,
          url: this.streamUrl
        };
      }
    }
  }

  setPinnedSelected() {
    if (this.utility.pinnedVideo) {
      this.inPlaySports.forEach(sport => {
        sport.competitions.forEach(comp => {
          comp.game.forEach(element => {
            if (element.id === this.utility.pinnedVideo.gameId) {
              this.selected = element;
            }
          });
        });
      });
    }
  }

  setAnimation() {
    const supportedAlias = ["Soccer", "Basketball", "Tennis", "IceHockey", "Volleyball"];
    if (!supportedAlias.includes(this.gameInfo.alias)) {
      return;
    }
    setTimeout(() => {
      this.destroyAnimation();
      const container = this.document.getElementById('live-animation');
      if (container) {
        const obj = {
          container: container,
          language: this.language === 'en' ? 'eng' : 'zhh',
          sportAlias: this.gameInfo.alias,
          debugMode: false
        };
        if (this.gameInfo.alias === 'Tennis') {
          obj['field'] = this.liveEvent.info.field;
        }
        this.sportAnimation = SportAnimation.createSportAnimation(obj);
        this.startAnimation();
      }
    }, 100);
  }

  startAnimation() {
    if (this.sportAnimation && this.liveEvent) {
      const teamsInfo = [
        {
          name: this.liveEvent.team1_name,
          score: this.liveEvent.info.score1
        },
        {
          name: this.liveEvent.team2_name,
          score: this.liveEvent.info.score2
        }
      ];
      this.sportAnimation.setTeamsInfo(teamsInfo);
      if (this.liveEvent.last_event) {
        this.sportAnimation.setAnimationType(this.liveEvent.last_event.type_id);
        this.sportAnimation.setAnimationSide(this.liveEvent.last_event.side);
      }
    }
  }

  destroyAnimation() {
    if (this.sportAnimation) {
      this.sportAnimation.destroy();
      this.sportAnimation = undefined;
    }
  }

  logInAction() {
    this.showLogin = true;
    this.subscriptionsService.setShowLogin(true);
  }

  getGameState(game){
    const state = game.info.current_game_state;
    if (GAME_STATES[state]) {
      if(state !== '' && state !== 'Half Time' && this.gameInfo && (GAME_STATES[state].hasOwnProperty(this.gameInfo.sportId))){
        return GAME_STATES[state][this.gameInfo.sportId][this.language]
      } else {
        if(state === 'Half Time'){
          return 'Half Time';
        } else {
          return GAME_STATES[state]['others'][this.language]
        }
      }
    } else {
      return '';
    }
  }

}
