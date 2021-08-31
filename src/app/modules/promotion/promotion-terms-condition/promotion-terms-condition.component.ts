import { Component, OnInit, } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { JsonService } from "../../../shared/services/json/json.service";
import {SubscriptionsService} from "../../../shared/services/subscriptions/subscriptions.service";
import { Subscription } from 'rxjs';

@Component({
  selector: 'workspace-promotion-terms-condition',
  templateUrl: './promotion-terms-condition.component.html',
  styleUrls: ['./promotion-terms-condition.component.scss']
})
export class PromotionTermsConditionComponent implements OnInit {

  panelOpenState = false;
  currentPageLanguage: any;
  term_and_condition: any;
  showSearch: Boolean;
  showSearchSub: Subscription;
  constructor(
    private route: ActivatedRoute,
    private jsonService: JsonService,
    private router : Router,
    private subscriptionsService: SubscriptionsService
  ) { 
    this.currentPageLanguage = localStorage.getItem("pageLanguage");
    this.showSearchSub = this.subscriptionsService.getShowHomeSearch().subscribe(data => {
      if(data){
       this.showSearch = true;
      } 
    })
  }

  ngOnInit(): void {
    const ID = this.route.snapshot.params['id'];
    console.log(ID);

    let filename = 'promotion-t&c-en';
    if(this.currentPageLanguage === 'zh'){
      filename = 'promotion-t&c-ch';
    }
    this.jsonService.getJson(filename).subscribe((data: any) => {
      const t_and_c = data.find(d => d.id === ID);
      if(t_and_c) {
        this.term_and_condition = t_and_c;
      }
      else {
        this.term_and_condition = data[0];
        // this.router.navigate(['/promotion']);
      }
    })
  }

}
