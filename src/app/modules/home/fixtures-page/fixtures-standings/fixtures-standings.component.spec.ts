import { async, ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { FixturesStandingsComponent } from './fixtures-standings.component';

describe('FixturesStandingsComponent', () => {
  let component: FixturesStandingsComponent;
  let fixture: ComponentFixture<FixturesStandingsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ FixturesStandingsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FixturesStandingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
