import { Component, EventEmitter, OnInit, Output, Renderer2 } from '@angular/core';

@Component({
  selector: 'workspace-password-recover',
  templateUrl: './password-recover.component.html',
  styleUrls: ['./password-recover.component.scss']
})
export class PasswordRecoverComponent implements OnInit {
  @Output() backToLoginEmitter: EventEmitter<any> = new EventEmitter();

  recoverType: any;
  constructor(private renderer: Renderer2) { }

  ngOnInit(): void {
    this.recoverType = 1;
  }

  backToLogin(){
    this.backToLoginEmitter.emit(false);
    this.renderer.removeClass(document.body, 'pass-recover');
  }

}
