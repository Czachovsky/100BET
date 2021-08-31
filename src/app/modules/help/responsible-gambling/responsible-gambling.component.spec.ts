import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResponsibleGamblingComponent } from './responsible-gambling.component';

describe('ResponsibleGamblingComponent', () => {
  let component: ResponsibleGamblingComponent;
  let fixture: ComponentFixture<ResponsibleGamblingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ResponsibleGamblingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ResponsibleGamblingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
