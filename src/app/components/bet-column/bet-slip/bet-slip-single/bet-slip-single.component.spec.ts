import { async, ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { BetSlipSingleComponent } from './bet-slip-single.component';

describe('BetSlipSingleComponent', () => {
  let component: BetSlipSingleComponent;
  let fixture: ComponentFixture<BetSlipSingleComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ BetSlipSingleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BetSlipSingleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
