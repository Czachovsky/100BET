import { Component, EventEmitter, OnInit, Output } from '@angular/core';

@Component({
  selector: 'workspace-deposit-numpad',
  templateUrl: './deposit-numpad.component.html',
  styleUrls: ['./deposit-numpad.component.scss']
})
export class DepositNumpadComponent implements OnInit {
  predefinedValues = ['300', '500', '1000', '1500', '3000', '4999'];
  @Output() hideNumpad: EventEmitter<any> = new EventEmitter<any>();
  @Output() valueFromNumpad: EventEmitter<any> = new EventEmitter();
  value: any = [];
  selectedPredefined: boolean;
  constructor() {
  }

  ngOnInit(): void {
  }

  setPredefinedVal(val) {
    this.value = val.split('');
    this.valueFromNumpad.emit(this.value);
    this.selectedPredefined = true;
  }

  clickButton(button) {
    if (button !== 'backspace') {
      if (this.value.includes('.') && button === '.') {
        return;
      } else {
        if (this.value.length === 1 && this.value[0] === 0) {
          this.value = [];
        }
        this.value.push(button);
      }
      this.valueFromNumpad.emit(this.value);
    } else {
      if(this.selectedPredefined){
        this.value = [0];
      } else {
        this.value.pop();
        if(this.value[this.value.length-1] === '.'){
          this.value.pop();
        }
        if(!this.value.length){
          this.value = [0];
        }
      }

      this.valueFromNumpad.emit(this.value);
    }
  }

  setHideNumpad() {
    this.hideNumpad.emit(true);
  }
}
