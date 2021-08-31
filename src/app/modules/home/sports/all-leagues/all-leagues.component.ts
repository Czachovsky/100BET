import { Component, OnInit, Output, EventEmitter, OnDestroy } from '@angular/core';
import {AnimationsService} from "../../../../shared/services/animations/animations.service";
import { filter, map } from "rxjs/operators";
import { ActivatedRoute, ActivationEnd, Router } from "@angular/router";
import { WebsocketService } from "../../../../shared/services/websocket/websocket.service";
import * as _ from 'lodash';
import { Subscription } from "rxjs";
import { SubscriptionsService } from '../../../../shared/services/subscriptions/subscriptions.service';
import { UtilityService } from '../../../../shared/services/utility.service';

@Component({
  selector: 'workspace-all-leagues',
  templateUrl: './all-leagues.component.html',
  styleUrls: ['./all-leagues.component.scss']
})
export class AllLeaguesComponent implements OnInit, OnDestroy {
  sportName: string;
  competitionObject: any = {};
  @Output() fullSportName: EventEmitter<any> = new EventEmitter<any>();
  routerSubscription: Subscription;
  websocketTimestamp: any;
  languageChange: Subscription;
  onlyOneItem: boolean;
  tempObj;
  constructor(
    private animationService: AnimationsService,
    private actRoute: ActivatedRoute,
    public subscriptionService: SubscriptionsService,
    private router: Router,
    private utility: UtilityService,
    private websocket: WebsocketService) {

      this.languageChange = this.subscriptionService.getLanguage().subscribe(lang => {
        if(lang){
          // this.getSportData(this.sportName);
        }
      });
  }

  ngOnInit(): void {
    this.websocketTimestamp = new Date().getTime();
    this.routerSubscription = this.router.events.pipe(
      filter(event => event instanceof ActivationEnd),
      map((event: any) => event.snapshot)).subscribe(e => {
      if (e.params.sport) {
        this.sportName = this.decodeSportAlias(e.params.sport);
        this.getSportData(this.sportName);
      }
    })

    this.sportName = this.decodeSportAlias(this.actRoute.snapshot.paramMap.get('sport'));

    this.getSportData(this.sportName);

    this.websocket.getData().subscribe((data) => {
      if (data.data && data.data !== 'null' && data.data !== 'undefined') {
        if (data.rid === `OHB-sportpage-${this.websocketTimestamp}`) {
          this.tempObj = _.cloneDeep(_.values(data.data.data.sport)[0]);
          this.competitionObject = Object.assign({}, _.values(data.data.data.sport)[0]);
          this.competitionObject['region'] =[..._.sortBy([..._.values(this.competitionObject['region'])], o => o.order)];
          this.competitionObject['region'].map(e => {
            e.competition = [..._.sortBy([..._.values(e.competition).filter(comp => {
              return comp;
              // return comp.name.toLowerCase().indexOf('outright') === -1;
            })], o => o.order)]
          });
          this.fullSportName.emit(this.competitionObject.name);
          if(this.competitionObject.region.length === 1){
            this.onlyOneItem = true;
          }
          let favorites = [];
          this.competitionObject.region.forEach(region => {
            favorites = [...favorites, ...region.competition.filter(x => x.favorite).map(obj => ({ ...obj, region: {id: region.id, alias: region.alias} }))];
          });
          this.competitionObject['region'] = this.competitionObject['region'].filter(x => {
            return x.competition.length > 0;
          });
          if (favorites.length) {
            this.competitionObject['region'] = this.competitionObject['region'].filter(x => {
              return x.competition.length > 0;
            });
            this.competitionObject['region'] = [ {name: 'Main Lists', competition: favorites }, ...this.competitionObject['region']];
          }
        }
      }
    })
  }

  getSportData(sport) {
    this.competitionObject = {};
    this.websocket.sendMessage({
      "command": "get",
      "params": {
        "source": "betting",
        "what": {
          "competition": [],
          "game": [],
          "region": [],
          "sport": [
            "name"
          ]

        },
        "where": {
          "sport": {
            "alias": `${ sport.split('-')[0].charAt(0).toUpperCase() }${ sport.split('-')[0].slice(1) }`
          },
          "game": {
            "show_type": {
              "@ne": "OUTRIGHT"
            }
          }

        },
        "subscribe": false
      },
      "rid": `OHB-sportpage-${this.websocketTimestamp}`
    })
  }

  toggleTableBody(element) {
    this.animationService.slideToggle(element);
  }

  goToCountryOrRegion(e, region) {
    const sport = this.actRoute.snapshot.params.sport;
    if (region.name === 'Main Lists') {
      this.router.navigate([`/sportsbook/${sport}/competitions/${e.region.id}/${e.id}/match-result`]);
    } else {
      this.router.navigate([`/sportsbook/${sport}/competitions/${region.id}/${e.id}/match-result`]);
    }
  }

  decodeSportAlias(alias) {
    return alias.split('-').map(e => {
      return e.charAt(0).toUpperCase() + e.slice(1);
    }).join('')
  }

  ngOnDestroy() {
      this.routerSubscription.unsubscribe();
      this.websocketTimestamp = '';
  }

}
