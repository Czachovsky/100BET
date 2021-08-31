import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ActivationEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter, map } from 'rxjs/operators';

@Component({
  selector: 'workspace-competition-standings',
  templateUrl: './competition-standings.component.html',
  styleUrls: ['./competition-standings.component.scss']
})
export class CompetitionStandingsComponent implements OnInit {
  sportName: string;
  routerSubscription: Subscription;

  constructor(private actRoute: ActivatedRoute) { }

  ngOnInit(): void {
    const url = 'http://statistics.100100188.com/#/en/statistics/competition/' + this.actRoute.snapshot.params.competitionId + '/overview';
    window.open(url, "_blank");
  }
}
