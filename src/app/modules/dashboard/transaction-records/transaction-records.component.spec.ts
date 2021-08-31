import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransactionRecordsComponent } from './transaction-records.component';

describe('TransactionRecordsComponent', () => {
  let component: TransactionRecordsComponent;
  let fixture: ComponentFixture<TransactionRecordsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TransactionRecordsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TransactionRecordsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
