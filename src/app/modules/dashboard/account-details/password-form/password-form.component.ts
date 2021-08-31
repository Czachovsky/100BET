import { Component, EventEmitter, OnInit, Output } from '@angular/core';

@Component({
  selector: 'workspace-password-form',
  templateUrl: './password-form.component.html',
  styleUrls: ['./password-form.component.scss']
})
export class PasswordFormComponent implements OnInit {
  showPassword1:boolean;
  error: boolean;
  @Output() submitPass: EventEmitter<any> = new EventEmitter<any>();
  constructor() { }

  ngOnInit(): void {
  }

  submitPassword(pass){
   if(pass.value && pass.value !== ''){
     this.submitPass.emit(pass.value);
   } else {
     this.error = true;
   }
  }

}
