import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BetSlipMultipleComponent } from './bet-slip-multiple.component';

describe('BetSlipMultipleComponent', () => {
  let component: BetSlipMultipleComponent;
  let fixture: ComponentFixture<BetSlipMultipleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BetSlipMultipleComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BetSlipMultipleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
