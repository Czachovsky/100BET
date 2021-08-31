import { Component, OnInit } from '@angular/core';
import { JsonService } from '../../../shared/services/json/json.service';

@Component({
  selector: 'workspace-responsible-gambling',
  templateUrl: './responsible-gambling.component.html',
  styleUrls: ['./responsible-gambling.component.scss']
})
export class ResponsibleGamblingComponent implements OnInit {

  currentPageLanguage: any;
  responsibleGambling: any;

  constructor(
    private jsonService: JsonService
  ) {
    this.currentPageLanguage = localStorage.getItem('pageLanguage');

  }

  ngOnInit(): void {

    const filename = 'help-responsible-gambling-'+this.currentPageLanguage;
    this.jsonService.getJson(filename).subscribe((data: any) => {
      this.responsibleGambling = data;
    });
  }

}
