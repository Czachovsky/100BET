import { Component, OnDestroy, OnInit } from '@angular/core';
import { JsonService } from '../../../shared/services/json/json.service';
import { environment } from '../../../../environments/environment';
import { UtilityService } from '../../../shared/services/utility.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'workspace-contact-us',
  templateUrl: './contact-us.component.html',
  styleUrls: ['./contact-us.component.scss']
})
export class ContactUsComponent implements OnInit, OnDestroy {
  currentPageLanguage: any;
  contactUs: any;
  loadingChat: Boolean = false;
  chatLoadSubscription: Subscription;
  constructor(private jsonService: JsonService, public utility: UtilityService) {
    this.currentPageLanguage = localStorage.getItem('pageLanguage');
    this.chatLoadSubscription = this.utility.isChatLoaded$.subscribe(data => {
      this.loadingChat = false;
    })
  }
  ngOnDestroy() {
    if(this.chatLoadSubscription){
      this.chatLoadSubscription.unsubscribe();
    }
  }

  ngOnInit(): void {
    const filename = 'help-contact-us-'+this.currentPageLanguage;
    this.jsonService.getJson(filename).subscribe((data: any) => {
      this.contactUs = data;
    });
  }

  loadChat() {
    if(!this.utility._isChatLoaded){
      this.loadingChat = true;
      this.utility.triggerLoadZendeskChat();
    } else {
      this.utility.hideOrShowChat();
    }
  }
}
