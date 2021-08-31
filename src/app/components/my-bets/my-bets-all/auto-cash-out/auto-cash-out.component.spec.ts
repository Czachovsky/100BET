import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AutoCashOutComponent } from './auto-cash-out.component';

describe('AutoCashOutComponent', () => {
  let component: AutoCashOutComponent;
  let fixture: ComponentFixture<AutoCashOutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AutoCashOutComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AutoCashOutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
