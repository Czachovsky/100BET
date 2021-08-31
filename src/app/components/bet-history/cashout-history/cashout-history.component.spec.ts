import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CashoutHistoryComponent } from './cashout-history.component';

describe('CashoutHistoryComponent', () => {
  let component: CashoutHistoryComponent;
  let fixture: ComponentFixture<CashoutHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CashoutHistoryComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CashoutHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
