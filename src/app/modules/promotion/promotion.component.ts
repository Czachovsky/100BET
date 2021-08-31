import { Component, OnInit } from '@angular/core';
import {SubscriptionsService} from "../../shared/services/subscriptions/subscriptions.service";
import { Subscription } from 'rxjs';
import { en_data, zh_data } from './promotions_static';

@Component({
  selector: 'workspace-promotion',
  templateUrl: './promotion.component.html',
  styleUrls: ['./promotion.component.scss']
})
export class PromotionComponent implements OnInit {
  language = 'en';


  showSearch: Boolean;
  showSearchSub: Subscription;
  constructor(private subscriptionsService: SubscriptionsService) {
    this.showSearchSub = this.subscriptionsService.getShowHomeSearch().subscribe(data => {
      if(data){
       this.showSearch = true;
      } 
    })
  }

  ngOnInit(): void {
    this.language = localStorage.getItem('pageLanguage');

  }

  getData() {
    return this.language === 'en' ? en_data : zh_data;
  }
}
