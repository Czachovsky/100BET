import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BetslipDoublesComponent } from './betslip-doubles.component';

describe('BetslipDoublesComponent', () => {
  let component: BetslipDoublesComponent;
  let fixture: ComponentFixture<BetslipDoublesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BetslipDoublesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BetslipDoublesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
