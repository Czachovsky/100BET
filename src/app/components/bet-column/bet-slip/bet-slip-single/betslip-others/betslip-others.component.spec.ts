import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BetslipOthersComponent } from './betslip-others.component';

describe('BetslipOthersComponent', () => {
  let component: BetslipOthersComponent;
  let fixture: ComponentFixture<BetslipOthersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BetslipOthersComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BetslipOthersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
