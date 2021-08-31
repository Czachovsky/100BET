import { async, ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AsianHandicapComponent } from './asian-handicap.component';

describe('AsianHandicapComponent', () => {
  let component: AsianHandicapComponent;
  let fixture: ComponentFixture<AsianHandicapComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AsianHandicapComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AsianHandicapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
