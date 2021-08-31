import { Component, EventEmitter, OnDestroy, OnInit, Output, Renderer2 } from '@angular/core';
import { WebsocketService } from '../../shared/services/websocket/websocket.service';
import { AuthService } from '../../shared/services/auth/auth.service';
import { SubscriptionsService } from '../../shared/services/subscriptions/subscriptions.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'workspace-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit, OnDestroy {
  @Output() passwordRecover: EventEmitter<any> = new EventEmitter();
  isError: boolean;
  errorMessage: string;
  checkForError: Subscription;
  passRec: boolean;
  verificationType: number;
  loginErr: boolean;
  passErr: boolean;
  loginLoading: boolean;
  showPassword: boolean;
  constructor(
    private websocketService: WebsocketService,
    private auth: AuthService,
    private subscriptions: SubscriptionsService,
    private renderer: Renderer2
  ) {
    this.checkForError = this.subscriptions.getError().subscribe((data) => {
      if (data) {
        this.loginLoading = false;
      }
    });
  }

  ngOnInit(): void {
    this.showPassword = false;
    this.loginErr = false;
    this.passErr = false;
    this.passRec = false;
    this.verificationType = 1;
  }

  logIn(login, pass, event, remember) {
    event.preventDefault();
    if(remember){
      localStorage.setItem('100BetRememberMe',  'true');
    }
    if (login !== '') {
      this.loginErr = false;
    }
    if (pass !== '') {
      this.passErr = false;
    }
    if (login !== '' && pass !== '') {
      this.loginLoading = true;
      this.auth.SignIn(login, pass);
    } else {
      if (login === '') {
        this.loginErr = true;
      }
      if (pass === '') {
        this.passErr = true;
      }
    }
  }

  ngOnDestroy() {
    this.checkForError.unsubscribe();
  }

  goToRegister() {
    this.subscriptions.setShowRegister(true);
  }
  goToPasswordRecover() {
    this.passwordRecover.emit(true);
    this.renderer.addClass(document.body, 'pass-recover');
  }
}
