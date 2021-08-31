import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { AnimationsService } from "../../../shared/services/animations/animations.service";

@Component({
  selector: 'workspace-my-bets-cash-out',
  templateUrl: './my-bets-cash-out.component.html',
  styleUrls: ['./my-bets-cash-out.component.scss']
})
export class MyBetsCashOutComponent implements OnInit, OnChanges {

  @Input() cashOutArr: any;

  constructor(private animationService: AnimationsService) { }

  ngOnInit(): void {
  //  console.log('cashOutArr', this.cashOutArr)
  }
  ngOnChanges(changes: SimpleChanges) {
    if (changes['cashOutArr'] && changes['cashOutArr'].currentValue) {
        this.cashOutArr = changes['cashOutArr'].currentValue;
    }
  }
  expandIt(e){
    this.animationService.slideToggle(e);
  }

}
