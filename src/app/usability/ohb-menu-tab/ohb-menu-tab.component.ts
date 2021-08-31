import {
  Component,
  Input,
  OnInit,
  EventEmitter,
  Output,
  ElementRef,
  ViewChild,
  OnChanges,
  SimpleChanges,
  ChangeDetectorRef,
} from '@angular/core';
import { JsonService } from '../../shared/services/json/json.service';
import { MenuTabItems } from './menu-tab';

@Component({
  selector: 'workspace-ohb-menu-tab',
  templateUrl: './ohb-menu-tab.component.html',
  styleUrls: ['./ohb-menu-tab.component.scss'],
})
export class OhbMenuTabComponent implements OnInit, OnChanges {
  @Input() menuItems: any;
  @Output() clickedItem: EventEmitter<any> = new EventEmitter<any>();
  menuElements: MenuTabItems;
  icons: any = [];
  @ViewChild('scrollEl') scrollEl: ElementRef;
  constructor(public jsonService: JsonService, private cdr: ChangeDetectorRef) {
    this.jsonService.getJson(`sports-icons`).subscribe(data => {
      this.icons = data;
      if(this.icons.length) {
        this.handleIcons();
      }
    });
  }

  ngOnInit(): void {
    if(this.icons.length) {
      this.menuItems.map((element, index) => {
        index > 0 ? (element.active = false) : (element.active = true);
        const idx = this.icons.findIndex(x => x.alias === element.alias);
        element['icon'] = idx !== -1 ? this.icons[idx]['icon'] : 'assets/images/icons/sports/soccer.png';
      });
      this.menuElements = this.menuItems;
      this.cdr.detectChanges();
    }
  }
  ngOnChanges(changes: SimpleChanges) {
    if (changes['menuItems'] && changes['menuItems'].currentValue) {
      if(this.icons.length && changes['menuItems'].currentValue && changes['menuItems'].currentValue.length) {
        const actIdx = this.menuElements.findIndex(x => x.active);
        this.menuItems = changes['menuItems'].currentValue;
        this.menuItems.map((element, index) => {
          if (this.menuElements.length) {
            if (element) {
              if (element.id === this.menuElements[actIdx].id) {
                element.active = true;
              } else {
                element.active = false;
              }
            }
          } else {
            index > 0 ? (element.active = false) : (element.active = true);
          }
          const idx = this.icons.findIndex(x => x && x.alias === element.alias);
          element['icon'] = idx !== -1 ? this.icons[idx]['icon'] : 'assets/images/icons/sports/soccer.png';
        });
        this.menuElements = this.menuItems;
        this.cdr.detectChanges();
      }

    }
  }

  handleIcons() {
    if(this.icons.length) {
      this.menuItems.map((element, index) => {
        index > 0 ? (element.active = false) : (element.active = true);
        const idx = this.icons.findIndex(x => x.alias === element.alias);
        element['icon'] = idx !== -1 ? this.icons[idx]['icon'] : 'assets/images/icons/sports/soccer.png';
      });
      this.menuElements = this.menuItems;
      this.cdr.detectChanges();
    }
  }
  menuElementClick(element) {
    element.active = true;
    this.menuElements.map((el) => {
      if (el.id !== element.id) {
        el.active = false;
      }
    });
    this.clickedItem.emit(element);
  }

  showNavigationLeft() {
    if (this.scrollEl) {
      const hasHorizontalScrollbar = this.scrollEl.nativeElement.scrollLeft && this.scrollEl.nativeElement.scrollWidth > this.scrollEl.nativeElement.clientWidth;
      return hasHorizontalScrollbar;
    }
    return 0;
  }

  showNavigationRight() {
    if (this.scrollEl) {
      const maxScrollLeft = this.scrollEl.nativeElement.scrollWidth - this.scrollEl.nativeElement.clientWidth;
      const hasHorizontalScrollbar = maxScrollLeft !== Math.floor(this.scrollEl.nativeElement.scrollLeft) && this.scrollEl.nativeElement.scrollWidth > this.scrollEl.nativeElement.clientWidth;
      return hasHorizontalScrollbar;
    }
    return false;
  }

  scrollLeft() {
    this.scrollEl.nativeElement.scrollLeft -= 200;
  }

  scrollRight() {
    this.scrollEl.nativeElement.scrollLeft += 200;
  }
}
