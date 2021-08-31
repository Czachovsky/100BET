import { async, ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { BetSlipSettingsComponent } from './bet-slip-settings.component';

describe('BetSlipSettingsComponent', () => {
  let component: BetSlipSettingsComponent;
  let fixture: ComponentFixture<BetSlipSettingsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ BetSlipSettingsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BetSlipSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
