import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'workspace-betting-rules',
  templateUrl: './betting-rules.component.html',
  styleUrls: ['./betting-rules.component.scss']
})
export class BettingRulesComponent implements OnInit {

  currentPageLanguage: any;
  isEnglish: Boolean = true;
  constructor( public translate: TranslateService) { 
    this.currentPageLanguage = localStorage.getItem("pageLanguage");
    if(this.currentPageLanguage === 'zh'){
      this.isEnglish = false;
    }
  }

  ngOnInit(): void {
  }

}
