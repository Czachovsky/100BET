import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DepositNumpadComponent } from './deposit-numpad.component';

describe('DepositNumpadComponent', () => {
  let component: DepositNumpadComponent;
  let fixture: ComponentFixture<DepositNumpadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DepositNumpadComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DepositNumpadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
