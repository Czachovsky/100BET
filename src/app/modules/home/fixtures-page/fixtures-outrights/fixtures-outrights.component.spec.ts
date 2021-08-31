import { async, ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { FixturesOutrightsComponent } from './fixtures-outrights.component';

describe('FixturesOutrightsComponent', () => {
  let component: FixturesOutrightsComponent;
  let fixture: ComponentFixture<FixturesOutrightsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ FixturesOutrightsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FixturesOutrightsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
