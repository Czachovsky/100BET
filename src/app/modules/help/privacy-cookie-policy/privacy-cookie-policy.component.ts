import { Component, OnInit } from '@angular/core';
import { JsonService } from '../../../shared/services/json/json.service';

@Component({
  selector: 'workspace-privacy-cookie-policy',
  templateUrl: './privacy-cookie-policy.component.html',
  styleUrls: ['./privacy-cookie-policy.component.scss']
})
export class PrivacyCookiePolicyComponent implements OnInit {

  currentPageLanguage: any;
  privacyCookiePolicy: any;

  constructor(private jsonService: JsonService) {
    this.currentPageLanguage = localStorage.getItem('pageLanguage');
  }

  ngOnInit(): void {
    const filename = 'help-privacy-cookie-policy-'+this.currentPageLanguage;
    this.jsonService.getJson(filename).subscribe((data: any) => {
      this.privacyCookiePolicy = data;
    });
  }
}
