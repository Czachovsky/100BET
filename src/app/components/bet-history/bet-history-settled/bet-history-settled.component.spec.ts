import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BetHistorySettledComponent } from './bet-history-settled.component';

describe('BetHistorySettledComponent', () => {
  let component: BetHistorySettledComponent;
  let fixture: ComponentFixture<BetHistorySettledComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BetHistorySettledComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BetHistorySettledComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
