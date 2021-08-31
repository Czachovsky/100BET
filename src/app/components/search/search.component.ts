import { Component, Input, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { debounceTime } from 'rxjs/operators';
import { WebsocketService } from '../../shared/services/websocket/websocket.service';
import * as _ from 'lodash';
@Component({
  selector: 'workspace-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit {
  @Input() showSearch: boolean;
  apiSearchInput: FormControl = new FormControl('');
  gamesList: any = [];
  comeptitionsList: any = [];
  constructor(private websocket: WebsocketService) { }

  ngOnInit(): void {
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
      if (data !== '' && data.length > 3) {
        this.searchData(data);
      }
    });
  }

  searchData(string){
    this.websocket.sendMessage({
      "command": "get",
      "params": {
        "source": "betting",
        "what": {
          "sport": [
            "id",
            "name",
            "alias",
            "order"
          ],
          "competition": [],
          "region": []
        },
        "where": {
          "competition": {
            "name": {
              "@like": {
                "eng": string,
                "zhh": string
              }
            }
          },
          "game": {
            "@limit": 10
          }
        },
        "subscribe": false
      },
      "rid": "OHB-search-by-competition"
    });
    this.websocket.sendMessage({
      "command": "get",
      "params": {
        "source": "betting",
        "what": {
          "competition": [],
          "game": [
            "type",
            "start_ts",
            "team1_name",
            "team2_name",
            "id"
          ],
          "sport": [
            "id",
            "name",
            "alias"
          ]
        },
        "where": {
          "game": {
            "@or": [
              {
                "team1_name": {
                  "@like": {
                    "eng": string,
                    "zhh": string
                  }
                }
              },
              {
                "team2_name": {
                  "@like": {
                    "eng": string,
                    "zhh": string
                  }
                }
              }
            ],
            "@limit": 10
          }
        },
        "subscribe": false
      },
      "rid": "OHB-search-by-game"
    })
  }

  prepareSearchedObj(type,data){
  if(type === 'game'){

    this.gamesList = [..._.values(data)];
    this.gamesList.map(e => {
      e.competition = [..._.values(e.competition)];
      e.competition.map(f => {
        f.game = [..._.values(f.game)];
      })
    });
    this.gamesList.map(e => {
      e.games = [];
      e.competition.map((f,j) => {
        f.game.map(g => {
          g['competition'] = f.name;
          e.games.push(g);
        })
      })

    });

  } else if(type === 'competition'){
    this.comeptitionsList = [..._.values(data)];
    this.comeptitionsList.map(e => {
      e.region = [..._.values(e.region)];
      e.region.map(f => {
        f.competition = [..._.values(f.competition)];
      })
    })
  }
   // console.log(type, data, _.isEmpty(data));
  }

}
