import {Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
import {AnimationsService} from "../../../../shared/services/animations/animations.service";

@Component({
  selector: 'workspace-fixtures-standings',
  templateUrl: './fixtures-standings.component.html',
  styleUrls: ['./fixtures-standings.component.scss']
})
export class FixturesStandingsComponent implements OnInit {

  @Input() fixtureArray: any;
  @ViewChild('tableBody', {static: false}) tableBody: ElementRef;
  constructor(private animationService: AnimationsService) { }

  ngOnInit(): void {

  }

  toggleTableBody(element){
    this.animationService.slideToggle(element);
  }
}
