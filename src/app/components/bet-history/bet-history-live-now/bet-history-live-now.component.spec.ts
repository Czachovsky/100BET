import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BetHistoryLiveNowComponent } from './bet-history-live-now.component';

describe('BetHistoryLiveNowComponent', () => {
  let component: BetHistoryLiveNowComponent;
  let fixture: ComponentFixture<BetHistoryLiveNowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BetHistoryLiveNowComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BetHistoryLiveNowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
