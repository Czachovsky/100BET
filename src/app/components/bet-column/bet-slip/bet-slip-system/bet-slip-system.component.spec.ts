import { async, ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { BetSlipSystemComponent } from './bet-slip-system.component';

describe('BetSlipSystemComponent', () => {
  let component: BetSlipSystemComponent;
  let fixture: ComponentFixture<BetSlipSystemComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ BetSlipSystemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BetSlipSystemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
