import { Component, Input, OnInit } from '@angular/core';
import { OwlOptions } from 'ngx-owl-carousel-o';

@Component({
  selector: 'workspace-promotion-sports',
  templateUrl: './promotion-sports.component.html',
  styleUrls: ['./promotion-sports.component.scss']
})
export class PromotionSportsComponent implements OnInit {
  @Input() data: any[];

  featuredCarouselOptions: OwlOptions = {
    loop: true,
    dots: false,
    nav: false,
    navText: ['', ''],
    autoplay: false,
    autoplayTimeout: 10000,
    autoplayHoverPause: true,
    autoplayMouseleaveTimeout: 2000,
    responsive: {
      0: {
        items: 1.3,
      },
      550: {
        items: 2,
      },
      740: {
        items: 3,
      },
      992: {
        items: 4,
      },
    },
  };

  constructor() { }

  ngOnInit(): void {
    if (this.data && this.data.length === 1) {
      this.featuredCarouselOptions.loop = false
    }
  }

}