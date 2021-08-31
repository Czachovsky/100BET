import { Component, OnInit, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'workspace-promotions',
  templateUrl: './promotions.component.html',
  styleUrls: ['./promotions.component.scss']
})
export class PromotionsComponent implements OnInit {

  constructor() { }

  currentTab: String = "ALL"
  ngOnInit(): void {
  }

  changeTab(tab: String){
    this.currentTab = tab;
  }

}
