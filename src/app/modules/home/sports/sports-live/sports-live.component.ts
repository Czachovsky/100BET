import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'workspace-sports-live',
  templateUrl: './sports-live.component.html',
  styleUrls: ['./sports-live.component.scss']
})
export class SportsLiveComponent implements OnInit {
  @Input() activeSport: string;
  constructor(private router: Router) { }

  ngOnInit(): void {
    this.router.navigate(['/sportsbook/in-play'], {queryParams: {"sport": this.activeSport}});
  }

}
