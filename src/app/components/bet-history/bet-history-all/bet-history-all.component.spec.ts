import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BetHistoryAllComponent } from './bet-history-all.component';

describe('BetHistoryAllComponent', () => {
  let component: BetHistoryAllComponent;
  let fixture: ComponentFixture<BetHistoryAllComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BetHistoryAllComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BetHistoryAllComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
