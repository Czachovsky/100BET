import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BetslipSinglesComponent } from './betslip-singles.component';

describe('BetslipSinglesComponent', () => {
  let component: BetslipSinglesComponent;
  let fixture: ComponentFixture<BetslipSinglesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BetslipSinglesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BetslipSinglesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
