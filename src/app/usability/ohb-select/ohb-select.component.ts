import {Component, Input, OnInit, Output, EventEmitter, OnChanges, SimpleChanges} from '@angular/core';

@Component({
  selector: 'workspace-ohb-select',
  templateUrl: './ohb-select.component.html',
  styleUrls: ['./ohb-select.component.scss']
})
export class OhbSelectComponent implements OnInit, OnChanges {
  @Output() changeValue: EventEmitter<any> = new EventEmitter<any>();

  state: boolean;
  @Input() options: any;
  @Input() selected: any;

  constructor() {
  }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes && changes.options.currentValue) {
      this.options = [];
      this.options = [...changes.options.currentValue] || [];
    }
  }

  checkState() {
    this.state = !this.state;
  }

  clickedOutside() {
    this.state = false;
  }

  selectOption(value){
    this.changeValue.emit(value);
    this.state = false;
    this.selected = value;
  }
}
