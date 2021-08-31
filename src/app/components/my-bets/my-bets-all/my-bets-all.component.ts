import { Component, OnInit } from '@angular/core';
import { AnimationsService } from '../../../shared/services/animations/animations.service';

@Component({
  selector: 'workspace-my-bets-all',
  templateUrl: './my-bets-all.component.html',
  styleUrls: ['./my-bets-all.component.scss'],
})
export class MyBetsAllComponent implements OnInit {

  cashOutType:number;

  constructor(private animationService: AnimationsService) {
  }

  ngOnInit(): void {
    this.cashOutType = 1;
  }

  expandIt(e) {
    this.animationService.slideToggle(e);
  }
}
