import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { debounceTime } from 'rxjs/operators';
import { WebsocketService } from '../../../../shared/services/websocket/websocket.service';

@Component({
  selector: 'workspace-mail-recover',
  templateUrl: './mail-recover.component.html',
  styleUrls: ['./mail-recover.component.scss']
})
export class MailRecoverComponent implements OnInit {
  passwordRecoverByMail: FormGroup;
  thisMailError: boolean;
  isLoading: boolean;
  theresAnError: boolean;
  errorMessage: any;
  constructor(private fb: FormBuilder, private websocket: WebsocketService) {
    this.passwordRecoverByMail = fb.group({
      user_name: ['', [Validators.required, Validators.minLength(6)]],
      user_email: ['', Validators.compose([Validators.required,
        Validators.pattern('^(([^<>()\\[\\]\\\\.,;:\\s@"]+(\\.[^<>()\\[\\]\\\\.,;:\\s@"]+)*)|(".+"))' +
          '@((\\[[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}])|(([a-zA-Z\\-0-9]+\\.)+[a-zA-Z]{2,}))$'),
        Validators.maxLength(35)])],
    })
  }

  ngOnInit(): void {
    this.passwordRecoverByMail.valueChanges.pipe(debounceTime(700)).subscribe(data => {
      if(this.passwordRecoverByMail.get('user_email').value !== '' && !this.passwordRecoverByMail.get('user_email').valid){
        this.thisMailError = true;
      } else {
        this.thisMailError = false;
      }
      this.theresAnError = false;
    })
    this.websocket.getData().subscribe(data => {
      if (data.data && data.data !== 'null' && data.data !== 'undefined') {
        if(data.rid === 'fpass45092141833142'){
          this.isLoading = false;
          if(data.data.result !== 0){
            this.theresAnError = true;
            this.errorMessage = data.data.result_text;
          } else {
            this.theresAnError = false;
          }
          console.log(data);
        }
      }
    })
  }

  passwordRecover(){
    this.isLoading = true;
    this.websocket.sendMessage({
      'command': 'forgot_password',
      'params': { 'email': this.passwordRecoverByMail.get('user_email').value },
      'rid': 'fpass45092141833142'
    });
  }

}

