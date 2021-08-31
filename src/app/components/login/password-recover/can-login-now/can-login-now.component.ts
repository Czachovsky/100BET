import { Component, EventEmitter, OnInit, Output } from '@angular/core';

@Component({
  selector: 'workspace-can-login-now',
  templateUrl: './can-login-now.component.html',
  styleUrls: ['./can-login-now.component.scss']
})
export class CanLoginNowComponent implements OnInit {
  @Output()  openLogin = new EventEmitter<boolean>();
  constructor() { }

  ngOnInit(): void {
  }

  goToLogin(){
    this.openLogin.emit(true);
  }

}
