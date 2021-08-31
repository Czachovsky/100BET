import { async, ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { TotalGoalsComponent } from './total-goals.component';

describe('TotalGoalsComponent', () => {
  let component: TotalGoalsComponent;
  let fixture: ComponentFixture<TotalGoalsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ TotalGoalsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TotalGoalsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
