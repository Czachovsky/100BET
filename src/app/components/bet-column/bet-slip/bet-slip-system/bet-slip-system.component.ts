import {Component, Input, OnInit} from '@angular/core';
import {BetSlipService} from "../../../../shared/services/bet-slip/bet-slip.service";
import {SubscriptionsService} from "../../../../shared/services/subscriptions/subscriptions.service";

@Component({
  selector: 'workspace-bet-slip-system',
  templateUrl: './bet-slip-system.component.html',
  styleUrls: ['./bet-slip-system.component.scss']
})
export class BetSlipSystemComponent implements OnInit {

  @Input() pickedItems: any;
  showBankerOption: boolean;

  defaoultOption = {
    optionName: 'System 3/4',
    optionDisplayName: 'System 3/4',
    optionValue: '129q8wry283b7bc'
  }


  selectOptions = [
    {
      optionName: 'System 3/4',
      optionDisplayName: 'System 3/4',
      optionValue: '129q8wry283b7bc'
    },
    {
      optionName: 'Lucky 15',
      optionDisplayName: 'Lucky 15',
      optionValue: '2wdwrp2ii'
    },
    {
      optionName: 'Yankee',
      optionDisplayName: 'Yankee',
      optionValue: '23fvopwj23'
    }
  ]

  constructor(private subsctiptionService: SubscriptionsService,
              private betSlipService: BetSlipService) {
  }

  ngOnInit(): void {
  }

  changeSettings(what, newVal) {
    this.betSlipService.changeSetSlipObject(what, newVal);
  }

  changeSelectState(e) {
    e.selected = !e.selected;
    this.betSlipService.changeSetSlipObject('picks', this.pickedItems);
  }

  test(e) {
   // console.log(e);
  }
}
