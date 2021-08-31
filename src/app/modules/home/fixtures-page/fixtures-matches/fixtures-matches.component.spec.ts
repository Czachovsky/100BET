import { async, ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { FixturesMatchesComponent } from './fixtures-matches.component';

describe('FixturesMatchesComponent', () => {
  let component: FixturesMatchesComponent;
  let fixture: ComponentFixture<FixturesMatchesComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ FixturesMatchesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FixturesMatchesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
