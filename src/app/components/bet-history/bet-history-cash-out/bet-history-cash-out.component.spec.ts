import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BetHistoryCashOutComponent } from './bet-history-cash-out.component';

describe('BetHistoryCashOutComponent', () => {
  let component: BetHistoryCashOutComponent;
  let fixture: ComponentFixture<BetHistoryCashOutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BetHistoryCashOutComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BetHistoryCashOutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
