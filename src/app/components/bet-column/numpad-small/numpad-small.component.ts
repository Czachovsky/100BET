import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';

@Component({
  selector: 'workspace-numpad-small',
  templateUrl: './numpad-small.component.html',
  styleUrls: ['./numpad-small.component.scss']
})
export class NumpadSmallComponent implements OnInit {
  @Output() valueFromNumpad: EventEmitter<any> = new EventEmitter();
  @Output() acceptValueFromNumpad: EventEmitter<any> = new EventEmitter();
  @Input() initialStake: any;
  firstOperation = true;
  value: any = [];
  constructor() { }

  ngOnInit(): void {
    if(this.initialStake === 'NaN'){
      this.value = [];
    } else {
      this.value = this.initialStake.split('');
    }
    console.log('this.value', this.value)
  }

  clickButton(value){
    if(value !== 'OK' && value !== 'backspace'){
      if(this.value.includes('.') && value === '.'){
        return
      } else {
        if(this.value.length === 1 && this.value[0] === 0){
          this.value = [];
        }
        this.value.push(value);
      }
      this.valueFromNumpad.emit(this.value);
    }
    if(value === 'backspace'){

        this.value.pop();
        if(this.value[this.value.length-1] === '.'){
          this.value.pop();
        }
        if(!this.value.length){
          this.value = [0];
        }

      this.valueFromNumpad.emit(this.value);
    }
    if(value === 'OK'){
      this.value = [];
      this.acceptValueFromNumpad.emit(true);
    }
  }

}
