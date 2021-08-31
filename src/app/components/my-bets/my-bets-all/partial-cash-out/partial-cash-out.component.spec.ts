import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PartialCashOutComponent } from './partial-cash-out.component';

describe('PartialCashOutComponent', () => {
  let component: PartialCashOutComponent;
  let fixture: ComponentFixture<PartialCashOutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PartialCashOutComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PartialCashOutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
