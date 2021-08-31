import { Component, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { WebsocketService } from '../../shared/services/websocket/websocket.service';
import { debounceTime } from 'rxjs/operators';
import * as _ from 'lodash';
import { JsonService } from '../../shared/services/json/json.service';
import { Subscription } from 'rxjs';
import { WindowService } from '../../shared/services/window/window.service';
import { J } from '@angular/cdk/keycodes';

@Component({
  selector: 'workspace-advance-search',
  templateUrl: './advance-search.component.html',
  styleUrls: ['./advance-search.component.scss']
})
export class AdvanceSearchComponent implements OnInit {
  recentSearches: any = [];
  gamesList: any = [];
  comeptitionsList: any = [];
  sports: any = [];
  icons: any = [];
  isMobile = false;
  isMobileCheck: Subscription;
  @Input() showSearch: boolean;
  apiSearchInput: FormControl = new FormControl('');
  searchKeyword = '';
  isTyping = false;

  constructor(public dialog: MatDialog,
              private websocket: WebsocketService,
              public jsonService: JsonService,
              private windowService: WindowService) {
    this.isMobileCheck = this.windowService.onResize$.subscribe((data) => {
      if (data.width <= 997)
        this.isMobile = true;
      else
        this.isMobile = false;

    });
  }

  @ViewChild('secondDialog', { static: true }) secondDialog: TemplateRef<any>;

  openDialogWithTemplateRef(templateRef: TemplateRef<any>) {
    this.dialog.open(templateRef);
  }

  ngOnInit(): void {
    this.getFromLocal();
    if (this.windowService.getScreenSize() <= 992) {
      this.isMobile = true;
    } else {
      this.isMobile = false;
    }
    this.websocket.getData().subscribe((data) => {
      if (data.data && data.data !== 'null' && data.data !== 'undefined') {
        if (data.rid === 'OHB-search-by-competition') {
          this.prepareSearchedObj('competition', data.data.data.sport);
        }
        if (data.rid === 'OHB-search-by-game') {
          this.prepareSearchedObj('game', data.data.data.sport);

        }
      }
    });
    this.apiSearchInput.valueChanges.pipe(debounceTime(700)).subscribe(data => {
      this.searchKeyword = data;
      this.isTyping = true;
      if (this.searchKeyword !== '' && this.searchKeyword.length > 3)
        this.searchData(data);
      else
        this.isTyping = false;
    });
    this.jsonService.getJson(`sports-icons`).subscribe(data => {
      this.icons = data;
    });
  }

  counter(i: number) {
    return new Array(i);
  }

  searchData(string) {

    this.websocket.sendMessage({
      'command': 'get',
      'params': {
        'source': 'betting',
        'what': {
          'sport': [
            'type',
            'id',
            'name',
            'alias',
            'order'
          ],
          'competition': [],
          'region': []
        },
        'where': {
          'competition': {
            'name': {
              '@like': {
                'eng': string,
                'zhh': string
              }
            }
          },
          'game': {
            '@limit': 10
          }
        },
        'subscribe': false
      },
      'rid': 'OHB-search-by-competition'
    });
    this.websocket.sendMessage({
      'command': 'get',
      'params': {
        'source': 'betting',
        'what': {
          'competition': [],
          'game': [
            'is_started',
            'type',
            'start_ts',
            'team1_name',
            'team2_name',
            'id',
            'info'
          ],
          'sport': [
            'id',
            'name',
            'alias'
          ]

        },
        'where': {
          'game': {
            '@or': [
              {
                'team1_name': {
                  '@like': {
                    'eng': string,
                    'zhh': string
                  }
                }
              },
              {
                'team2_name': {
                  '@like': {
                    'eng': string,
                    'zhh': string
                  }
                }
              }
            ],
            '@limit': 10
          }
        },
        'subscribe': false
      },
      'rid': 'OHB-search-by-game'
    });


  }

  prepareSearchedObj(type, data) {

    if (type === 'game') {

      this.gamesList = [..._.values(data)];
      this.gamesList.map(e => {
        e.competition = [..._.values(e.competition)];
        e.competition.map(f => {
          f.game = [..._.values(f.game)];
        });
      });
      this.gamesList.map(e => {
        e.games = [];
        e.competition.map((f, j) => {

          f.game.map(g => {
            g['competition'] = f.name;
            const idx = this.icons.findIndex(x => x.alias === e.alias);
            g['icon'] = idx !== -1 ? this.icons[idx]['icon'] : 'assets/images/icons/sports/soccer.png';
            g['alias'] = e.alias;
            g['parentid'] = e.id;
            e.games.push(g);
          });
        });

      });

      this.gamesList.map(e => {
        e.games.map((f, j) => {
          f['alias'] = e.alias;
          f['parentid'] = e.id;

        });

      });
    } else if (type === 'competition') {
      this.comeptitionsList = [..._.values(data)];

      this.comeptitionsList.map(e => {
        e.region = [..._.values(e.region)];
        const idx = this.icons.findIndex(x => x.alias === e.alias);
        e['icon'] = idx !== -1 ? this.icons[idx]['icon'] : 'assets/images/icons/sports/soccer.png';
        e.region.map(f => {
          f.competition = [..._.values(f.competition)];

        });
      });

      this.sports = [..._.values(data)];
      this.sports.map(e => {
        e.region = [..._.values(e.sport)];
        const idx = this.icons.findIndex(x => x.alias === e.alias);
        e['icon'] = idx !== -1 ? this.icons[idx]['icon'] : 'assets/images/icons/sports/soccer.png';

      });

    }

    // console.log('XXXX-1', JSON.stringify(data));
    // console.log('XXXX-2', JSON.stringify(this.gamesList));
    // console.log('XXXX-3', JSON.stringify(this.comeptitionsList));
    // console.log('XXXX-4', JSON.stringify(this.sports));
  }

  onEnter() {
    this.isTyping = false;
    if (this.searchKeyword !== '' && this.searchKeyword.length > 3) {
      this.storeLocal(this.searchKeyword);
      this.searchData(this.searchKeyword);


    }
  }

  storeLocal(text) {

    const data = localStorage.getItem('recentsearch');
    let result;
    if (data != null) {
      result = JSON.parse(data);
      const isFound = result.filter(s => s === text);
      if (isFound.length === 0) {
        if (result.length > 9)
          result.shift();

        result.push(text);
        localStorage.setItem('recentsearch', JSON.stringify(result));

      }
      this.getFromLocal();
    } else {
      const recentsearch = [
        text
      ];
      localStorage.setItem('recentsearch', JSON.stringify(recentsearch));
    }

  }

  getFromLocal() {

    this.recentSearches = JSON.parse(localStorage.getItem('recentsearch')) || [];
    if (this.recentSearches.length > 0) {

      this.recentSearches = this.recentSearches.reverse();
      const limit = this.isMobile ? 5 : 10;

      if (this.recentSearches.length > limit) {

        const result: any = [];
        for (let i = 0; i < limit; i++) {
          result.push(this.recentSearches[i]);
        }
        this.recentSearches = result;
      }
    }
  }

  onSelectSearch(string) {
    this.isTyping = false;
    this.searchKeyword = string;
    this.searchData(string);
    this.storeLocal(string);
  }

  gotoMathch(item) {
    const mainID = item.parentid;
    const alias = item.alias;
    const id = item.id;
    const url = '/sportsbook/in-play/event-view/' + alias + '/' + mainID + '/' + id;
    if (item.type === 1)
      return url;
    else
      return '/sportsbook/markets/' + alias + '/' + mainID + '/' + id;
  }

}
