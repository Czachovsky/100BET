import { Component, OnInit, OnDestroy } from '@angular/core';
import { OwlOptions } from 'ngx-owl-carousel-o';
import { WindowService } from '../../../shared/services/window/window.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'workspace-casino-banner',
  templateUrl: './casino-banner.component.html',
  styleUrls: ['./casino-banner.component.scss']
})
export class CasinoBannerComponent implements OnInit {
  carouselOptions: OwlOptions = {
    items: 1,
    loop: true,
    dots: true,
    nav: false,
    autoplay: true,
    autoplayTimeout: 10000,
    responsive: {
      0: {
        items: 1
      }
    }
  }
  language = 'en';
  carouselItems: any = [];
  isMobileCheck: Subscription;
  isMobile: boolean;

  en_data = [
    {
      title: '',
      subtitle: '',
      img: '/assets/images/casino/en/casino_welcome_new_player_en.png',
    },
    {
      title: '',
      subtitle: '',
      img: '/assets/images/casino/en/bet_100_casino_en.png',
    },
    {
      title: '',
      subtitle: '',
      img: '/assets/images/casino/en/get_weekly_money_back_en.png',
    }
  ];
  en_data_mb = [
    {
      title: '',
      subtitle: '',
      img: '/assets/images/casino/en/casino_welcome_new_player_mb_en.png'
    },
    {
      title: '',
      subtitle: '',
      img: '/assets/images/casino/en/bet_100_casino_mb_en.png'
    },
    {
      title: '',
      subtitle: '',
      img: '/assets/images/casino/en/get_weekly_money_back_mb_en.png'
    }
  ];
  zh_data = [
    {
      title: '',
      subtitle: '',
      img: '/assets/images/casino/zh/casino_welcome_new_player_zh.png',
    },
    {
      title: '',
      subtitle: '',
      img: '/assets/images/casino/zh/bet_100_casino_zh.png',
    },
    {
      title: '',
      subtitle: '',
      img: '/assets/images/casino/zh/get_weekly_money_back_zh.png',
    }
  ];
  zh_data_mb = [
    {
      title: '',
      subtitle: '',
      img: '/assets/images/casino/zh/casino_welcome_new_player_mb_zh.png'
    },
    {
      title: '',
      subtitle: '',
      img: '/assets/images/casino/zh/bet_100_casino_mb_zh.png'
    },
    {
      title: '',
      subtitle: '',
      img: '/assets/images/casino/zh/get_weekly_money_back_mb_zh.png'
    }
  ];
  constructor(
    private windowService: WindowService,
  ) {
    this.language = localStorage.getItem('pageLanguage');
    this.isMobileCheck = this.windowService.onResize$.subscribe((data) => {
      if (data.width <= 997) {
        this.isMobile = true;
        if (this.isMobile) {
          this.getBanner()
        }
      } else {
        this.isMobile = false;
        if (!this.isMobile) {
          this.getBanner()
        }
      }
    });
  }


  ngOnInit(): void {
    if (this.windowService.getScreenSize() <= 997) {
      this.isMobile = true;
    } else {
      this.isMobile = false;
    }

    this.getBanner();
  }

  getBanner() {
    if(this.isMobile){
      this.carouselItems = this.language === 'en' ? this.en_data_mb : this.zh_data_mb;
    }
    else{
      this.carouselItems = this.language === 'en' ? this.en_data : this.zh_data;
    }
  }

}

