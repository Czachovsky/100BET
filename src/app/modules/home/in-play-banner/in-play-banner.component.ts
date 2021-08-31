import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { GAME_STATES } from "../../../shared/game-states";
@Component({
  selector: 'workspace-in-play-banner',
  templateUrl: './in-play-banner.component.html',
  styleUrls: ['./in-play-banner.component.scss']
})
export class InPlayBannerComponent implements OnInit, OnChanges {
  @Input() matchInfos: any;
  language: string;
  constructor() {
    this.language = localStorage.getItem('pageLanguage');
  }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['matchInfos'] && changes['matchInfos'].currentValue) {
      this.matchInfos = changes['matchInfos'].currentValue;
    }
  }

  getGameState(){
    const state = this.matchInfos.competition.game.info.current_game_state;
    if(state !== '' && state !== 'Half Time' && (GAME_STATES[state].hasOwnProperty(this.matchInfos['id']))){
      return GAME_STATES[state][this.matchInfos['id']][this.language]
    } else {
      if(state === 'Half Time'){
        return
      } else {
        return GAME_STATES[state]['others'][this.language]
      }
    }
  }

}
