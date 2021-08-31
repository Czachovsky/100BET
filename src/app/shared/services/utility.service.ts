import { ElementRef, Injectable, Renderer2, RendererFactory2 } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { GAME_STATES } from '../game-states';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UtilityService {
  private renderer: Renderer2;
  onLiveStream = new BehaviorSubject<any>(null);
  liveStream$ = this.onLiveStream.asObservable();
  onAnimate = new BehaviorSubject<any>(null);
  animation$ = this.onAnimate.asObservable();
  pinnedVideo: {gameId: number, url: string};
  _isChatVisible: boolean;
  _isChatLoaded: boolean;
  isChatLoaded = new BehaviorSubject<any>(null);
  isChatLoaded$ = this.isChatLoaded.asObservable();
  constructor(rendererFactory: RendererFactory2) {
    this.renderer = rendererFactory.createRenderer(null, null);
  }

  selectGameForLiveStream(url) {
    this.onLiveStream.next(url);
  }

  selectGameForAnimation(url) {
    this.onAnimate.next(url);
  }

  handleSingleDigit(time) {
    if(time && time.toString()[0] === '0') {
      return time;
    } else {
      return time < 10 ? '0' + time : time;
    }
  }

  getSeconds() {
    const seconds = new Date().getSeconds();
    return seconds < 10 ? '0' + seconds : seconds;
  }

  ordinal(i: number) {
    const j = i % 10, k = i % 100;
    if (j === 1 && k !== 11) {
        return i + "st";
    }
    if (j === 2 && k !== 12) {
        return i + "nd";
    }
    if (j === 3 && k !== 13) {
        return i + "rd";
    }
    return i + "th";
  }

  clean(obj) {
    for (const propName in obj) {
      if (obj[propName] === null || obj[propName] === undefined) {
        delete obj[propName];
      } else if (typeof obj[propName] === "object" && !Array.isArray(obj[propName])) {
        this.clean(obj[propName])
      }
    }
    return obj;
  }

  getGameState(state, sportId: number) {
    const language = localStorage.getItem('pageLanguage');
    if (
      GAME_STATES &&
      state && state !== 'Half Time' && GAME_STATES[state] &&
      GAME_STATES[state].hasOwnProperty(sportId)
    ) {
      return GAME_STATES[state][sportId][language];
    } else if(state === 'Half Time' && GAME_STATES['timeout'].hasOwnProperty(sportId)) {
      return GAME_STATES['timeout'][sportId][language];
    } else {
      return 'Break';
    }
  }

  resetWidth(elementRef) {
    // elementRef.forEach((element: ElementRef) => {
    //   this.renderer.setStyle(element.nativeElement, 'min-width', `${0}px`);
    // });
  }

  formatAlias(alias) {
    alias = alias.replace(' ', '');
    return alias.split(/(?=[A-Z])/).join('-').toLowerCase();
  }

  decodeSportAlias(alias) {
    return alias.split('-').map(e => {
      return e.charAt(0).toUpperCase() + e.slice(1);
    }).join('')
  }

  genrateRandomNumber(min, max, decimalPlaces): number {
    const rand = Math.random()*(max-min) + min;
    const power = Math.pow(10, decimalPlaces);
    const num = Math.floor(rand*power) / power;
    return num === 0 && decimalPlaces === 2 ? 0.11 : num;
  }

  adjustWidth(elementRef): any {
    // if (!elementRef.length) {
    //   return;
    // }
    // let maxWidth = 22;
    // setTimeout(() => {
    //   elementRef.forEach((element: ElementRef) => {
    //     const width = element.nativeElement.getBoundingClientRect().width;
    //     if (width > maxWidth) {
    //       maxWidth = width;
    //     }
    //   });
    //   elementRef.forEach((element: ElementRef) => {
    //     this.renderer.setStyle(element.nativeElement, 'min-width', `${maxWidth}px`);
    //   });
    // }, 10);
  }

  loadZendeskChat(callback) {
    const zdscript = document.createElement('script');
    zdscript.setAttribute('id', 'ze-snippet');
    zdscript.src = `https://static.zdassets.com/ekr/snippet.js?key=${environment.settings.zdscript_key}`;
    (document.getElementsByTagName('body')[0]).appendChild(zdscript);

    const zdonload = setInterval(() => {
      if (typeof window['zE'] !== "undefined" && typeof window['zE'].activate !== "undefined") {
        clearInterval(zdonload);
        callback();
      }
    }, 50, null)
  };

  triggerLoadZendeskChat() {
    this.loadZendeskChat(() => {
      window.setTimeout(() => {
        window['zE'].activate();
        this.isChatLoaded.next(true);
        this._isChatVisible = true;
        this._isChatLoaded = true;
      }, 1000);
    });
  }

  hideOrShowChat(){
    if(this._isChatVisible){
      window['zE'].hide();
      this._isChatVisible = false;
    } else {
      this._isChatVisible = true;
      window['zE'].show();
      window['zE'].activate();
    }
  }

}
