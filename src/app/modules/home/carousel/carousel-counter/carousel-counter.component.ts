import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';

@Component({
  selector: 'workspace-carousel-counter',
  templateUrl: './carousel-counter.component.html',
  styleUrls: ['./carousel-counter.component.scss']
})
export class CarouselCounterComponent implements OnInit, OnChanges {

  percentTime: any;
  tick: any;
  isPause: boolean;
  @Input() start: boolean;
  @Input() time: number;
  @Input() dragging: boolean;
  @Input() moved: any;
  progress: number;

  constructor() {

  }


  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges) {

    if (changes['time'] && changes['time'].currentValue) {
      this.time = this.time / 1000;

    }
    if (changes['start'] && changes['start'].currentValue) {
      this.startProgressBar();
    }
    if (changes['dragging'] && changes['dragging'].currentValue) {
      this.isPause = changes['dragging'].currentValue;
    }
    if (changes['moved'] && changes['moved'].currentValue) {
      this.isMoved();
    }
  }


  startProgressBar() {
    this.percentTime = 0;
    this.isPause = false;
    this.tick = setInterval(() => this.intervalProgressBar(), 10);
  }

  intervalProgressBar() {
    if (this.isPause === false) {
      this.percentTime += 1 / this.time;
      if (this.percentTime >= 100) {
        this.isMoved();
      }
    }

  }

  pauseOnDragging() {
    this.isPause = true;
  }

  isMoved() {
    clearTimeout(this.tick);
    this.startProgressBar();
  }
}
