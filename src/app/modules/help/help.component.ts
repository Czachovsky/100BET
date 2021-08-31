import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';

@Component({
  selector: 'workspace-casino',
  templateUrl: './help.component.html',
  styleUrls: ['./help.component.scss']
})
export class HelpComponent implements OnInit {

  isDesktop = true;
  isHelpPage = true;

  constructor(router: Router) {

    router.events.subscribe(
      (event: any) => {
        if (event instanceof NavigationEnd) {
          if (window.innerWidth < 768) {
            this.isDesktop = false;
          } else {
            this.isDesktop = true;
          }
          if (router.url === '/help') {
            this.isHelpPage = true;
          } else {
            this.isHelpPage = false;
          }
        }
      }
    );
  }

  ngOnInit(): void {
  }

}
