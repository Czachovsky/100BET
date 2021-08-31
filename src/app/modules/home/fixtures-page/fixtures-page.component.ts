import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, ActivationEnd, Router} from "@angular/router";
import {filter, map} from "rxjs/operators";
import {JsonService} from "../../../shared/services/json/json.service";
import {Observable} from "rxjs";
import {SubscriptionsService} from "../../../shared/services/subscriptions/subscriptions.service";

@Component({
  selector: 'workspace-fixtures-page',
  templateUrl: './fixtures-page.component.html',
  styleUrls: ['./fixtures-page.component.scss']
})
export class FixturesPageComponent implements OnInit {

  id: string;
  fixtureData: any;
  openedTable: string;

  routerObj: any = [];

  constructor(private actRoute: ActivatedRoute,
              private router: Router,
              private jsonService: JsonService,
              private subscriptionsService: SubscriptionsService) {
    this.subscriptionsService.setLeftMenuVisible(true);
  }

  ngOnInit(): void {

    this.actRoute.queryParams.subscribe(data => {
      if (data.tab) {
        this.openedTable = data.tab;
      } else {
        this.openedTable = 'matches';
      }
    })
    this.router.events.pipe(
      filter((event) => event instanceof ActivationEnd), map((event: any) => event.snapshot.params.id),)
      .subscribe((event) => {
        if (event && this.id !== event) {
          this.id = event;
          this.getFixtureDataset(this.id);
        }
      });

    this.id = this.actRoute.snapshot.paramMap.get('competition');
    this.getFixtureDataset(this.id);
    this.routerObj.push({
      name: this.actRoute.snapshot.params.sport,
      url: this.actRoute.snapshot.params.sport
    });
    this.routerObj.push({
      name: this.actRoute.snapshot.params.country,
      url: `${this.actRoute.snapshot.params.sport}/${this.actRoute.snapshot.params.country}`
    });
    this.routerObj.push({
      name: this.actRoute.snapshot.params.competition,
      url: ''
    });

  }

  getFixtureDataset(whatData) {
    this.jsonService.getJson(`fixture_${whatData}`).subscribe(data => {
      this.fixtureData = data;
    })
  }

  changeTable(whichOne) {
    this.openedTable = whichOne;
    this.router.navigate(['.'], {relativeTo: this.actRoute, queryParams: {"tab": whichOne}});
  }

}
