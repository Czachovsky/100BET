import { async, ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { DailyMatchesComponent } from './daily-matches.component';

describe('DailyMatchesComponent', () => {
  let component: DailyMatchesComponent;
  let fixture: ComponentFixture<DailyMatchesComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ DailyMatchesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DailyMatchesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
