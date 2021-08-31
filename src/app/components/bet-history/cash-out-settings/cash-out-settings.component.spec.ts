import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CashOutSettingsComponent } from './cash-out-settings.component';

describe('CashOutSettingsComponent', () => {
  let component: CashOutSettingsComponent;
  let fixture: ComponentFixture<CashOutSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CashOutSettingsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CashOutSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
