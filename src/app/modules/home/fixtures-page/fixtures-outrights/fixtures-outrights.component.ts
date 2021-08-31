import {Component, Input, OnInit} from '@angular/core';
import {AnimationsService} from "../../../../shared/services/animations/animations.service";

@Component({
  selector: 'workspace-fixtures-outrights',
  templateUrl: './fixtures-outrights.component.html',
  styleUrls: ['./fixtures-outrights.component.scss']
})
export class FixturesOutrightsComponent implements OnInit {

  @Input() fixtureArray: any;

  defaoultOption = {
    optionName: 'Asian Handicap & Goal Line',
    optionDisplayName: 'Asian Handicap & Goal Line',
    optionValue: '129q8wry283b7bc'
  }


  selectOptions = [
    {
      optionName: 'Asian Handicap & Goal Line',
      optionDisplayName: 'Asian Handicap & Goal Line',
      optionValue: '129q8wry283b7bc'
    },
    {
      optionName: '1st Half Asians',
      optionDisplayName: '1st Half Asians',
      optionValue: '2wdwrp2ii'
    },
    {
      optionName: 'Draw No Bet',
      optionDisplayName: 'Draw No Bet',
      optionValue: '23fvopwj23'
    },
    {
      optionName: 'Goals Odd/Even',
      optionDisplayName: 'Goals Odd/Even',
      optionValue: 'e23fdv'
    },
  ]

  constructor(private animationService: AnimationsService) {
  }

  ngOnInit(): void {
  }

  toggleTableBody(element) {
    this.animationService.slideToggle(element);
  }

  test(e){
    console.log(e);
  }
}
