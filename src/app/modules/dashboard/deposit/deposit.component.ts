import { Component, OnInit, Renderer2 } from '@angular/core';
import { HttpService } from '../../../shared/services/http/http.service';
import { DEPOSIT_CHANNELS } from './deposit-channels';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../../shared/services/auth/auth.service';
import { UtilityService } from '../../../shared/services/utility.service';
import { Router } from '@angular/router';

@Component({
  selector: 'workspace-deposit',
  templateUrl: './deposit.component.html',
  styleUrls: ['./deposit.component.scss']
})
export class DepositComponent implements OnInit {
  numpad;
  boolean;
  depositChannels: any = [];
  selectedChannel: any;
  predefinedValues = ['300', '500', '1000', '1500', '3000', '4999'];
  selectedValue: any;
  valueError: boolean;
  errorFromBancked: boolean;
  textErrorFromBancked: string;
  loading: boolean;
  pageLanguage: any;
  blockDeposit: boolean;
  showNoChannelsModal: boolean;
  confirmDeposit: boolean;
  amount: any;
  constructor(private http: HttpService,
              private translate: TranslateService,
              private auth: AuthService,
              private renderer: Renderer2,
              private utility: UtilityService,
              private router: Router) {
  }

  ngOnInit(): void {
    this.translate.currentLang === 'en' ? this.pageLanguage = 'en' : this.pageLanguage = 'ch';
    this.http.callRequest('payment/getdepositablepaymentmethods', 'GET').subscribe(data => {
      this.depositChannels = [...data];
      if (this.depositChannels.length) {
        for (const el of this.depositChannels) {
          if (el.isAvailable) {
            el.selected = true;
            break;
          }
        }
      }
      this.selectedChannel = this.depositChannels[0];
      // this.selectedValue = this.formatValue(this.selectedChannel.minAmount);
      if(this.depositChannels.filter(e => e.isAvailable).length){
        this.blockDeposit = false;
        this.showNoChannelsModal = false;
        this.selectedChannel = this.depositChannels.find(e => e.isAvailable);
      } else {
        this.blockDeposit = true;
        this.showNoChannelsModal = true;
      }
    });
  }

  selectChannel(channel) {
    this.selectedChannel = channel;
    if (Number(this.selectedValue) < this.selectedChannel.minAmount || Number(this.selectedValue) > this.selectedChannel.maxAmount) {
      this.selectedValue = this.formatValue(this.selectedChannel.minAmount);
    }
    this.depositChannels.map(e => {
      if (e.id !== channel.id) {
        e.selected = false;
      }
    });
    this.selectedChannel.selected = true;
  }

  getChannelName(locales) {
    return locales[this.pageLanguage];
  }

  selectValue(val) {
    this.selectedValue = this.formatValue(val);
  }

  validateAmount(event) {
    if (!((event.keyCode >= 48 && event.keyCode <= 57) ||
      (event.keyCode >= 96 && event.keyCode <= 105 && event.keyCode !== 101) ||
      event.keyCode === 44 || event.keyCode === 46)) {
      event.preventDefault();
    }
  }

  checkAmount(event) {
    setTimeout(() => {
      if (Number(event.target.value) < this.selectedChannel.minAmount || Number(event.target.value) > this.selectedChannel.maxAmount) {
        if (Number(event.target.value) < this.selectedChannel.minAmount) {
          this.selectedValue = this.formatValue(this.selectedChannel.minAmount);
        } else if (Number(event.target.value) > this.selectedChannel.maxAmount) {
          this.selectedValue = this.formatValue(this.selectedChannel.maxAmount);
        }
      } else {
        this.selectedValue = this.formatValue(event.target.value);
      }
    }, 1500);
  }

  formatValue(val) {
    return Number(val).toFixed(2);
  }

  depositNow() {
      this.loading = true;
      this.valueError = false;
      this.http.callRequest(`payment/deposit?amount=${Number(this.selectedValue)}&paymentSystem=${this.selectedChannel.paymentMethodName}&userId=${this.auth.authData['user_id']}`, 'POST').subscribe(data => {
        if(!data.error && !data.errorMessage && data.paymentProviderChannelDepositResults[0].errorMessage === null && data.paymentProviderChannelDepositResults[0].data.url !== undefined){
          window.open(data.paymentProviderChannelDepositResults[0].data.url);
          this.loading = false;
        } else {
          if(data.paymentProviderChannelDepositResults){
            this.textErrorFromBancked = data.paymentProviderChannelDepositResults[0].errorMessage;
          } else {
            if(data.error){
              this.textErrorFromBancked = data.error;
            } else {
              this.textErrorFromBancked = data.errorMessage;
            }
          }
          this.errorFromBancked = true;
          this.loading = false;
        }
      });
  }

  showNumpad() {
    this.numpad = true;
    this.renderer.addClass(document.body, 'numpad-open');
  }

  getvalueFromNumpad(val) {
    this.selectedValue = Number(val.join('')).toFixed(2);
    if (Number(this.selectedValue) >= this.selectedChannel.minAmount || Number(this.selectedValue) <= this.selectedChannel.maxAmount) {
      this.valueError = false;
    }
  }

randomizeAmount(){
  this.amount = Number(this.selectedValue);
  const random = this.utility.genrateRandomNumber(0, 1, 2);
  if(Number(this.amount - random) < this.selectedChannel.minAmount){
    this.amount += random;
  } else {
    this.amount -= random;
  }
  this.amount = this.amount.toFixed(2);
}

  showConfirmationModal(){
    if (Number(this.selectedValue) < this.selectedChannel.minAmount || Number(this.selectedValue) > this.selectedChannel.maxAmount) {
      this.valueError = true;
    } else {
      this.randomizeAmount();
      this.selectedValue = this.amount;
      this.confirmDeposit = true;
    }
  }
  goToHelp(){
    this.router.navigate(['help'], {queryParams: {'openChat': 'true'}});
  }
}

