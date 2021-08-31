import { Component, OnInit } from '@angular/core';
import { JsonService } from '../../../shared/services/json/json.service';

@Component({
  selector: 'workspace-help',
  templateUrl: './help.component.html',
  styleUrls: ['./help.component.scss']
})
export class HelpComponent implements OnInit {
  currentPageLanguage: any;
  help: any;

  constructor(
    private jsonService: JsonService
  ) {
    this.currentPageLanguage = localStorage.getItem('pageLanguage');

  }

  ngOnInit(): void {

    const filename = 'help-help-'+this.currentPageLanguage;
    this.jsonService.getJson(filename).subscribe((data: any) => {
      this.help = data;
    });
  }
}
