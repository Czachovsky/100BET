import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComplaintsProcedureComponent } from './complaints-procedure.component';

describe('ComplaintsProcedureComponent', () => {
  let component: ComplaintsProcedureComponent;
  let fixture: ComponentFixture<ComplaintsProcedureComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ComplaintsProcedureComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ComplaintsProcedureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
