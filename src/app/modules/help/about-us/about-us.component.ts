import { Component, OnInit } from '@angular/core';
import { JsonService } from '../../../shared/services/json/json.service';

@Component({
  selector: 'workspace-about-us',
  templateUrl: './about-us.component.html',
  styleUrls: ['./about-us.component.scss']
})
export class AboutUsComponent implements OnInit {
  currentPageLanguage: any;
  aboutUs: any;

  constructor(private jsonService: JsonService) {
    this.currentPageLanguage = localStorage.getItem('pageLanguage');
  }

  ngOnInit(): void {
    const filename = 'help-about-us-'+this.currentPageLanguage;
    this.jsonService.getJson(filename).subscribe((data: any) => {
      this.aboutUs = data;
    });
  } 
}
