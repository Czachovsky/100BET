import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PhoneRecoverComponent } from './phone-recover.component';

describe('PhoneRecoverComponent', () => {
  let component: PhoneRecoverComponent;
  let fixture: ComponentFixture<PhoneRecoverComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PhoneRecoverComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PhoneRecoverComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
