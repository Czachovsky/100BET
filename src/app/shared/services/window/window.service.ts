import { EventManager } from '@angular/platform-browser';
import { Injectable, EventEmitter } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class WindowService {

  public onResize$ = new EventEmitter<{ width: number; height: number; }>();

  constructor(eventManager: EventManager) {
    eventManager.addGlobalEventListener('window', 'resize',
      e => this.onResize$.emit({
        width: e.target.innerWidth,
        height: e.target.innerHeight
      }));

  }

  getScreenSizeOnResize() {
    this.onResize$.emit({
      width: window.innerWidth,
      height: window.innerHeight
    });
  }
  getScreenSize(){
    return window.innerWidth;
  }
}
