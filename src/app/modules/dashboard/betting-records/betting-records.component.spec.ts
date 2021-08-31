import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BettingRecordsComponent } from './betting-records.component';

describe('BettingRecordsComponent', () => {
  let component: BettingRecordsComponent;
  let fixture: ComponentFixture<BettingRecordsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BettingRecordsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BettingRecordsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
