import { async, ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { BetSlipMultiComponent } from './bet-slip-multi.component';

describe('BetSlipMultiComponent', () => {
  let component: BetSlipMultiComponent;
  let fixture: ComponentFixture<BetSlipMultiComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ BetSlipMultiComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BetSlipMultiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
