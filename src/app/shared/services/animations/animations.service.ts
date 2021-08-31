import {Injectable, Renderer2, RendererFactory2} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AnimationsService {
  private renderer: Renderer2;

  constructor(rendererFactory: RendererFactory2) {
    this.renderer = rendererFactory.createRenderer(null, null);
  }

  setStyleToElement(element, style: object) {
    for (const attr of Object.keys(style)) {
      this.renderer.setStyle(element, attr, style[attr]);
    }
  }

  removeStyleFromElement(element, style: Array<string>) {
    style.forEach(attr => {
      this.renderer.removeStyle(element, attr);
    });
  }

  slideUp(parent, target, duration = 500) {
    this.renderer.addClass(parent, 'sliding');
    this.setStyleToElement(target, {
      'transition-property': 'height, margin, padding',
      'transition-duration': `${duration}ms`,
      'box-sizing': 'border-box',
      'height': `${target.offsetHeight}px`
    });
    // tslint:disable-next-line:no-unused-expression
    target.offsetHeight;
    this.setStyleToElement(target, {
      'overflow': 'hidden',
      'height': 0,
      'padding-top': 0,
      'padding-bottom': 0,
      'margin-top': 0,
      'margin-bottom': 0
    });

    setTimeout(() => {
      this.setStyleToElement(target, {'display': 'none'});
      this.removeStyleFromElement(target, ['height', 'padding-top', 'padding-bottom', 'margin-top', 'margin-bottom', 'overflow', 'transition-duration', 'transition-property']);
      this.renderer.removeClass(parent, 'sliding');
    }, duration);

  }

  slideDown(parent, target, duration = 500) {
    this.renderer.addClass(parent, 'sliding');
    this.removeStyleFromElement(target, ['display']);
    let display = getComputedStyle(target).display;
    if (display === 'none') {
      display = 'block';
    }
    this.setStyleToElement(target, {'display': display});
    const height = target.offsetHeight;
    this.setStyleToElement(target, {
      'overflow': 'hidden',
      'height': 0,
      'padding-top': 0,
      'padding-bottom': 0,
      'margin-top': 0,
      'margin-bottom': 0
    });
    // tslint:disable-next-line:no-unused-expression
    target.offsetHeight;
    this.setStyleToElement(target, {
      'box-sizing': 'border-box',
      'transition-property': 'height, margin, padding',
      'transition-duration': `${duration}ms`,
      'height': `${height}px`,
    });
    this.removeStyleFromElement(target, ['padding-top', 'padding-bottom', 'margin-top', 'margin-bottom']);
    setTimeout(() => {
      this.removeStyleFromElement(target, ['height', 'overflow', 'transition-duration', 'transition-property']);
      this.renderer.removeClass(parent, 'sliding');
    }, duration);
  }

  slideToggle(target, duration = 500) {
    if (getComputedStyle(this.renderer.nextSibling(target)).display === 'none') {
      this.renderer.addClass(target, 'active');
      return this.slideDown(target, this.renderer.nextSibling(target), duration);
    } else {
      this.renderer.removeClass(target, 'active');
      return this.slideUp(target, this.renderer.nextSibling(target), duration);
    }
  }


}
