import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {OwlOptions} from 'ngx-owl-carousel-o';
import {JsonService} from "../../../shared/services/json/json.service";

@Component({
  selector: 'workspace-carousel',
  templateUrl: './carousel.component.html',
  styleUrls: ['./carousel.component.scss']
})
export class CarouselComponent implements OnInit {

  carouselItems: any;
  startCarousel: boolean;
  pauseOnDragging: boolean;
  carouselMoved: any;
  carouselLength: any;
  activeSlide = 0;
  carouselOptions: OwlOptions = {
    items: 1,
    loop: true,
    dots: false,
    nav: false,
    autoplay: true,
    autoplayTimeout: 10000,
    responsive: {
      0: {
        items: 1
      }
    }
  }
  compititions = ['welcome_offer', '100bet_grand_open'];
  currentPageLanguage: any;

  constructor(private jsonService: JsonService, private cdr: ChangeDetectorRef) {
    this.carouselLength = 0;
    this.currentPageLanguage = localStorage.getItem("pageLanguage");
  }

  ngOnInit(): void {
    this.startCarousel = false;
    this.pauseOnDragging = false;
    this.carouselMoved = false;
    this.carouselMoved = 0;

    let filename = 'main-carousel';
    if(this.currentPageLanguage === 'zh'){
      filename = 'main-carousel-ch';
    }
    this.jsonService.getJson(filename).subscribe(e => {
      this.carouselItems = e;
      this.carouselLength = this.carouselItems.length;
    })
  }


  initializedCarousel() {
    this.startCarousel = true;
    this.cdr.detectChanges();
  }

  isDragging(e) {
    this.pauseOnDragging = e.dragging;
  }

  isMoved(e) {
    this.activeSlide = e.startPosition;
    this.carouselMoved += 1;
  }

}
