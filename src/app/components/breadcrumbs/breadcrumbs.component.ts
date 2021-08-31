import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import {ActivatedRoute, ActivationEnd, Router} from "@angular/router";
import {filter, map} from "rxjs/operators";

@Component({
  selector: 'workspace-breadcrumbs',
  templateUrl: './breadcrumbs.component.html',
  styleUrls: ['./breadcrumbs.component.scss']
})
export class BreadcrumbsComponent implements OnInit, OnChanges {

  breadCrumbPath: any;
  showBreadcrumbs: boolean;
  @Input() homeUrl: string;
  @Input() routeArr: any;
  constructor(private route: Router, private actRoute: ActivatedRoute) {
    this.showBreadcrumbs = false;
    this.breadCrumbPath = [];
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['routeArr'] && changes['routeArr'].currentValue) {
      this.routeArr = changes['routeArr'].currentValue
    }
  }

  ngOnInit(): void {
    // this.route.events.pipe(
    //   filter(event => event instanceof ActivationEnd), map((event: any) => event.snapshot._routerState)
    // ).subscribe(event => {
    //   if ((event.url.includes('home/in-play/') || event.url.includes('home/sports/')) && !event.url.includes('competition')) {
    //     this.showBreadcrumbs = true;
    //     this.breadCrumbPath = this.prepareBreadcrumbsArray(event.url)
    //   } else {
    //     this.showBreadcrumbs = false;
    //   }
    // })
    //
    // if ((this.route.url.includes('home/in-play/') || this.route.url.includes('home/sports/')) && !this.route.url.includes('competition')) {
    //   this.showBreadcrumbs = true;
    //   this.breadCrumbPath = this.prepareBreadcrumbsArray(this.route.url)
    // } else {
    //   this.showBreadcrumbs = false;
    // }
    // console.log(this.actRoute)
  }

  /**
   * @param {string} arr  We can display parameter description
   * @returns And we can display returned value description :)
   */
  prepareBreadcrumbsArray(arr) {
    const tempArr = arr.split('?')[0].split('/home/')[1].split('/');
    tempArr.splice(0, 1);
    return tempArr;
  }

}
