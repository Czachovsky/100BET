import {Component, OnInit, Output} from '@angular/core';
import {EventEmitter} from "@angular/core";
import {BetSlipService} from "../../../shared/services/bet-slip/bet-slip.service";


@Component({
  selector: 'workspace-bet-slip-settings',
  templateUrl: './bet-slip-settings.component.html',
  styleUrls: ['./bet-slip-settings.component.scss']
})
export class BetSlipSettingsComponent implements OnInit {

  @Output() isCloseSettings: EventEmitter<any> = new EventEmitter();
  betSlipSettings: any;


  constructor(private betSlipService: BetSlipService) {
    this.betSlipSettings = this.betSlipService.getBetSlipFromLocalStorage();
  }


  ngOnInit(): void {
  }

  changeSettings(what, newVal) {
    this.betSlipService.changeSetSlipObject(what, newVal);
  }

  test(e) {
    //console.log(e.target.checked);
  }

  closeSettings() {
    this.isCloseSettings.emit(false);
  }
}
