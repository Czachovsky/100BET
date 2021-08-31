import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { debounceTime } from 'rxjs/operators';
import { WebsocketService } from '../../../../shared/services/websocket/websocket.service';

@Component({
  selector: 'workspace-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss']
})
export class ChangePasswordComponent implements OnInit {
  @Output() changesSuccessfully: EventEmitter<any> = new EventEmitter<any>();
  clickPrevent = false;
  changePasswordForm: FormGroup;
  error1: boolean;
  error2: boolean;
  error3: boolean;
  error4: boolean;
  showPassword: boolean;
  showPassword1: boolean;
  loading: boolean;
  isError: boolean;
  errorMessage: any;
  ridTimestamp: any;
  notFilled: boolean;
  constructor(private fb: FormBuilder, private websocket: WebsocketService) {
    this.changePasswordForm = fb.group({
      'oldPassword': ['', Validators.compose([Validators.required])],
      'newPassword': ['', Validators.compose([Validators.required,
        Validators.pattern('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)[a-zA-Z\\d@$!%*#?&]{6,20}$')])],
      'repeatPassword': ['', Validators.compose([Validators.required])]
    });

  }

  ngOnInit(): void {
    this.notFilled = true;
    this.changePasswordForm.valueChanges.pipe(debounceTime(700)).subscribe(data => {
      this.checkForErrors();
    });
    this.websocket.getData().subscribe(data => {
      if (data.data && data.data !== 'null' && data.data !== 'undefined') {
        if (data.rid === `OHB-changePass-${this.ridTimestamp}`) {
          this.loading = false;
          if (data.data.result === 0) {
            this.changesSuccessfully.emit(true);
          } else {
            this.error3 = true;
            this.isError = true;
            this.errorMessage = `${data.data.result} - ${data.data.result_text}`;
          }
        }
      }
    })
  }

  changePassword(val) {
    if (this.changePasswordForm.valid) {
      this.loading = true;
      this.ridTimestamp = new Date().getTime();
      this.websocket.sendMessage({
        "command": "update_user_password",
        "params": {
          "password": val.value.oldPassword,
          "new_password": val.value.newPassword
        },
        "rid": `OHB-changePass-${this.ridTimestamp}`
      })
    } else {
      this.checkForErrors();
    }
  }

  checkForErrors() {
    this.isError = false;
    this.errorMessage = '';
    this.changePasswordForm.controls.repeatPassword.value !== this.changePasswordForm.controls.newPassword.value
    && this.changePasswordForm.controls.repeatPassword.touched && this.changePasswordForm.controls.repeatPassword.touched ? this.error2 = true : this.error2 = false;
    !(this.changePasswordForm.controls.newPassword.valid) && this.changePasswordForm.controls.newPassword.dirty ? this.error1 = true : this.error1 = false;
    !(this.changePasswordForm.controls.oldPassword.valid) && this.changePasswordForm.controls.oldPassword.dirty ? this.error3 = true : this.error3 = false;
    (this.changePasswordForm.controls.oldPassword.touched && this.changePasswordForm.controls.newPassword.touched) &&
    (this.changePasswordForm.controls.oldPassword.value === this.changePasswordForm.controls.newPassword.value) ? this.error4 = true : this.error4 = false;
    if(this.changePasswordForm.valid){
      this.notFilled = false;
    }
  }



}
