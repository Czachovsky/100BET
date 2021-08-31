import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../shared/services/auth/auth.service';
import { SubscriptionsService } from '../../shared/services/subscriptions/subscriptions.service';
import { Subscription } from 'rxjs';
import { WebsocketService } from '../../shared/services/websocket/websocket.service';
import { SearchCountryField, TooltipLabel, CountryISO, PhoneNumberFormat } from 'ngx-intl-tel-input';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { RecaptchaComponent } from 'ng-recaptcha';

@Component({
  selector: 'workspace-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent implements OnInit {
  @ViewChild('recapthaEl') recapthaEl: RecaptchaComponent
  waitOneMinute: boolean;
  waitingTimer: any;
  @Output() userRegistered: EventEmitter<any> = new EventEmitter<any>();
  userNameError: boolean;
  phoneTyped: boolean;
  registerForm: FormGroup;
  email: string;
  acceptTerms: boolean;
  registerLoading: boolean;
  isLoggedSubscription: Subscription;
  errorBC: any;
  usernameValidation = {
    chars: false,
    eng_and_numbers: false,
    one_letter: false,
    no_space: false,
  }
  passwordValidation = {
    chars: false,
    eng_and_numbers: false,
    one_letter: false,
    one_number: false,
    no_space: false
  }
  SearchCountryField = SearchCountryField;
  TooltipLabel = TooltipLabel;
  CountryISO = CountryISO;
  PhoneNumberFormat = PhoneNumberFormat;
  preferredCountries: CountryISO[] = [CountryISO.China];
  seconds = 60000;
  timer: any;
  recaptcha: any;
  recaptchaResolved: boolean;
  constructor(private fb: FormBuilder,
              private auth: AuthService,
              private subscription: SubscriptionsService,
              private router: Router,
              private websocket: WebsocketService) {
    this.waitOneMinute = false;
    this.waitingTimer = '01:00';
    this.isLoggedSubscription = this.subscription.getIsLoggedIn().subscribe(data => {
      this.registerLoading = false;
      this.userRegistered.emit(true);
    })

    this.registerForm = fb.group({
      phone_number: ['', [Validators.required]],
      user_full_name: [
        '',
        Validators.compose([
          Validators.required
        ])
      ],
      password: [
        '',
        Validators.compose([
          Validators.required,
          Validators.minLength(8),
          Validators.maxLength(20),
          Validators.pattern('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)[a-zA-Z\\d@$!%*#?&]{6,20}$')
        ]),
      ],
      password_confirm: ['', Validators.required],
      user_name: [
        '',
        Validators.compose([
          Validators.pattern('^[A-Za-z\\d]{6,20}$'),
          Validators.required
        ])
      ],
      terms: [null, Validators.required],
      verification_code: [null, Validators.required],
      recaptcha: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.recaptchaResolved = false;
    this.acceptTerms = false;
    this.websocket.getData().subscribe(data => {
      if (data.data && data.data !== 'null' && data.data !== 'undefined') {
        if(data.rid === 'OHB-regstration'){
          console.log(data);
          this.registerLoading = false;
          if(data.data.result === 'OK'){
            this.auth.loginByJWE(data.data.details.jwe_token);
          } else {
            this.recapthaEl.reset();
            this.recaptchaResolved = false;
            this.recaptcha = false;
          }
        }
        if(data.rid === '161100099460215sendSmsWithCode'){
          if(data.data.result === 0){
            this.waitOneMinute = true;
            this.watingTimerFn();
          }
        }
      }
    })
    this.userNameError = false;
    this.acceptTerms = false;
    this.registerForm.valueChanges.subscribe(data => {
      if(this.registerForm.get('phone_number').value !== null){
        this.phoneTyped = true;
      } else {
        this.phoneTyped = false;
      }
      this.userNameValidator(data.user_name);
      this.userPasswordValidator(data.password);
      this.checkUsername(data.user_full_name);
    });
  }
  registerUser(form) {
    console.log(form)
    if (!this.registerForm.controls.terms.value) {
      this.acceptTerms = false;
    }

    if (!this.registerForm.valid) {
      this.registerForm.get('user_name').markAsDirty();
      this.registerForm.get('password').markAsDirty();
      this.registerForm.get('password_confirm').markAsDirty();
      this.registerForm.get('phone_number').markAsDirty();
      this.registerForm.get('user_full_name').markAsDirty();
      this.registerForm.get('verification_code')
      this.phoneTyped = true;

      return false;
    } else {
      this.registerLoading = true;
      this.auth.RegisterUser(form);
    }
  }
  check() {
    //console.log(this.registerForm);
  }
  oncheckboxChange(event) {
    this.acceptTerms = event;
  }
  showLogin(){
    this.subscription.setShowLogin(true);
  }

  get currentLang() {
    return localStorage.getItem('pageLanguage');
  }

  userNameValidator(value) {
    const upperCaseLetters = /[a-zA-Z]/g;
    (value.length <= 20 && value.length >= 6) ? this.usernameValidation.chars = true : this.usernameValidation.chars = false;
    (value.includes(' ') || value === '') ? this.usernameValidation.no_space = false : this.usernameValidation.no_space = true;
    value.match(upperCaseLetters) ? this.usernameValidation.one_letter = true : this.usernameValidation.one_letter = false;
    /^[A-Za-z\d]+$/i.test(value) ? this.usernameValidation.eng_and_numbers = true : this.usernameValidation.eng_and_numbers = false;
  }

  userPasswordValidator(value) {
    const upperCaseLetters = /[A-Z]/g;
    const numbers = /[0-9]/g;
    (value.length <= 20 && value.length >= 6) ? this.passwordValidation.chars = true : this.passwordValidation.chars = false;
    (value.includes(' ') || value === '') ? this.passwordValidation.no_space = false : this.passwordValidation.no_space = true;
    value.match(upperCaseLetters) ? this.passwordValidation.one_letter = true : this.passwordValidation.one_letter = false;
    value.match(numbers) ? this.passwordValidation.one_number = true : this.passwordValidation.one_number = false;
    /^[A-Za-z\d]+$/i.test(value) ? this.passwordValidation.eng_and_numbers = true : this.passwordValidation.eng_and_numbers = false;
  }

  goToHelp() {
    this.subscription.setOpenModal(false);
    this.subscription.setCloseModal(true);
    this.router.navigateByUrl('/help');
  }

  redirect(url) {
    window.open(url, '_blank')
  }

  checkUsername(value) {
    if(value.length > 0){
      const numbersAndSpecials = /[0-9\d@$!%*#?&]/g;
      !value.match(numbersAndSpecials) ? this.userNameError = true : this.userNameError = false;
    }
  }

  getVerificationCode() {
    if (!this.registerForm.get('phone_number').valid) {
      this.registerForm.get('phone_number').markAsDirty();
      this.phoneTyped = true;
    } else {
      this.auth.sendForSmsCode(this.registerForm.get('phone_number').value.e164Number, 1);
    }
  }

  watingTimerFn() {
    if (this.seconds === 60000) {
      this.timer = setInterval(() => this.watingTimerFn(), 1000);
    }
    this.seconds -= 1000;
    const tmr = (this.seconds / 1000) < 10 ? `0${this.seconds / 1000}` : this.seconds / 1000;
    this.waitingTimer = `00:${tmr}`;
    if (this.seconds <= 0) {
      clearInterval(this.timer);
      this.seconds = 60000;
      this.waitOneMinute = false;
    }

  }

  resolved(e){
    if(e){
      this.recaptchaResolved = true;
      this.recaptcha = e;
      this.registerForm.patchValue({ recaptcha: this.recaptcha })
      console.log(this.registerForm)
    }
  }
  recaptchaError(e){
    if(e){
      this.recaptchaResolved = false;
      this.recaptcha = false;
    }
  }

  loadZendeskChat(callback) {
    const zdscript = document.createElement('script');
    zdscript.setAttribute('id', 'ze-snippet');
    zdscript.src = `https://static.zdassets.com/ekr/snippet.js?key=${environment.settings.zdscript_key}`;
    (document.getElementsByTagName('body')[0]).appendChild(zdscript);

    const zdonload = setInterval(() => {
      if (typeof window['zE'] !== "undefined" && typeof window['zE'].activate !== "undefined") {
        clearInterval(zdonload);
        callback();
      }
    }, 50, null)
  };

  loadChat() {
    this.loadZendeskChat(() => {
      window.setTimeout(() => {
        window['zE'].activate();
      }, 1000);
    });
  }

  test(e){
    console.log(e);
  }
}
