import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BetHistoryUnsettledComponent } from './bet-history-unsettled.component';

describe('BetHistoryUnsettledComponent', () => {
  let component: BetHistoryUnsettledComponent;
  let fixture: ComponentFixture<BetHistoryUnsettledComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BetHistoryUnsettledComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BetHistoryUnsettledComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
