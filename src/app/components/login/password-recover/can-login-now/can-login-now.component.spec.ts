import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CanLoginNowComponent } from './can-login-now.component';

describe('CanLoginNowComponent', () => {
  let component: CanLoginNowComponent;
  let fixture: ComponentFixture<CanLoginNowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CanLoginNowComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CanLoginNowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
