import { async, ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SportsLiveComponent } from './sports-live.component';

describe('SportsLiveComponent', () => {
  let component: SportsLiveComponent;
  let fixture: ComponentFixture<SportsLiveComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ SportsLiveComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SportsLiveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
