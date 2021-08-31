import { Component, OnInit } from '@angular/core';
import { en_data, zh_data } from '../../promotion/promotions_static';

@Component({
  selector: 'workspace-casino-promotions',
  templateUrl: './casino-promotions.component.html',
  styleUrls: ['./casino-promotions.component.scss']
})
export class CasinoPromotionsComponent implements OnInit {
  language = 'en';
  promotion_bonus: any;
  constructor() { 
    this.language = localStorage.getItem('pageLanguage');
  }

  ngOnInit(): void {
    this.promotion_bonus = this.language === 'en' ? en_data[1].data[0].promotionOffer.slice(0, 3) : zh_data[1].data[0].promotionOffer.slice(0, 3);
    console.log(this.promotion_bonus)
  }

}
