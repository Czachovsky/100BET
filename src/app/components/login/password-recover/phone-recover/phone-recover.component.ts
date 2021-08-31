import { Component, OnInit } from '@angular/core';
import { WebsocketService } from '../../../../shared/services/websocket/websocket.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { debounceTime } from 'rxjs/operators';
import { SearchCountryField, TooltipLabel, CountryISO, PhoneNumberFormat } from 'ngx-intl-tel-input';
import { Subject } from 'rxjs';
import { SubscriptionsService } from '../../../../shared/services/subscriptions/subscriptions.service';
import { TranslateService } from '@ngx-translate/core';
@Component({
  selector: 'workspace-phone-recover',
  templateUrl: './phone-recover.component.html',
  styleUrls: ['./phone-recover.component.scss']
})
export class PhoneRecoverComponent implements OnInit {
  passwordRecoverByPhone: FormGroup;
  isLoading: boolean;
  errorMessage: any;
  SearchCountryField = SearchCountryField;
  TooltipLabel = TooltipLabel;
  CountryISO = CountryISO;
  PhoneNumberFormat = PhoneNumberFormat;
  preferredCountries: CountryISO[] = [CountryISO.China];
  constructor(public translate: TranslateService,private ws: WebsocketService, private fb: FormBuilder, private subSer: SubscriptionsService) {
    this.passwordRecoverByPhone = fb.group({
      userphone: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit(): void {

    this.ws.getData().subscribe(data => {
      if (data.data && data.data !== 'null' && data.data !== 'undefined') {
        if (data.rid === 'fpassmob45092141833142') {
          this.isLoading = false;
          if (data.data.result === 0) {
            this.subSer.setShowResetSuccessfull(true);
          }
        }
      }
    });
  }

  sendSmsPasswordReset() {
    console.log(this.passwordRecoverByPhone)
    this.isLoading = true;
    this.ws.sendMessage({
      'command': 'reset_password_via_sms',
      'params': {
        'key': this.passwordRecoverByPhone.get('userphone').value.e164Number.replace('+', '')
      },
      'rid': 'fpassmob45092141833142'
    });
  }

}
