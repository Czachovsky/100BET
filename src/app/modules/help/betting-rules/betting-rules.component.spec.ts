import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BettingRulesComponent } from './betting-rules.component';

describe('BettingRulesComponent', () => {
  let component: BettingRulesComponent;
  let fixture: ComponentFixture<BettingRulesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BettingRulesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BettingRulesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
