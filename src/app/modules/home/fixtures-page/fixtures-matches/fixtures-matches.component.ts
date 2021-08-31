import { Component, Input, OnInit } from '@angular/core';
import { AnimationsService } from "../../../../shared/services/animations/animations.service";
import { JsonService } from "../../../../shared/services/json/json.service";
import { TranslateService } from "@ngx-translate/core";

@Component({
  selector: 'workspace-fixtures-matches',
  templateUrl: './fixtures-matches.component.html',
  styleUrls: ['./fixtures-matches.component.scss']
})
export class FixturesMatchesComponent implements OnInit {

  @Input() fixtureArray: any;

  defaoultOption: any = {};
  selectOptions: any = [];

  constructor(private animationService: AnimationsService, private jsonService: JsonService, private translate: TranslateService) {
  }

  ngOnInit(): void {
    this.jsonService.getJson(`select-${ this.translate.currentLang }`).subscribe(data => {
      this.defaoultOption = data["default"];
      this.selectOptions = data["options"];


    })
  }


  toggleTableBody(element) {
    this.animationService.slideToggle(element);
  }

  test(e) {
    console.log(e);
  }
}
