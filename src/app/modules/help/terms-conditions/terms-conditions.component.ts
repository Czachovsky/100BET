import { Component, OnInit } from '@angular/core';
import { JsonService } from '../../../shared/services/json/json.service';

@Component({
  selector: 'workspace-terms-conditions',
  templateUrl: './terms-conditions.component.html',
  styleUrls: ['./terms-conditions.component.scss']
})
export class TermsConditionsComponent implements OnInit {

  currentPageLanguage: any;
  termConditions: any;

  constructor(private jsonService: JsonService) {
    this.currentPageLanguage = localStorage.getItem('pageLanguage');
  }

  ngOnInit(): void {
    const filename = 'help-terms-conditions-'+this.currentPageLanguage;
    this.jsonService.getJson(filename).subscribe((data: any) => {
      this.termConditions = data;
    });
  }
}
