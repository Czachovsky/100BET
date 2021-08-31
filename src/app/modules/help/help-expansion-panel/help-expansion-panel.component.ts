import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';

@Component({
  selector: 'workspace-help-expansion-panel',
  templateUrl: './help-expansion-panel.component.html',
  styleUrls: ['./help-expansion-panel.component.scss'],
})

export class HelpExpansionPanelComponent implements OnInit {

  activeUrl: string;
  router:any;
  help = [
    '/help/help',
    '/help/contact-us',
    '/help/terms-conditions',
    '/help/responsible-gambling',
    '/help/privacy-cookie-policy',
    '/help/betting-rules',
    '/help/complaints-procedure',
  ];

  constructor(router: Router) {
    this.router=router;
  }

  ngOnInit(): void {
    this.router.events.subscribe((event: any) => {
      if (event instanceof NavigationEnd) {
        this.activeUrl = this.router.url;
      }
    });
  }
}
