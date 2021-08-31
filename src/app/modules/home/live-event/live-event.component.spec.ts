import { async, ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { LiveEventComponent } from './live-event.component';

describe('LiveEventComponent', () => {
  let component: LiveEventComponent;
  let fixture: ComponentFixture<LiveEventComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ LiveEventComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LiveEventComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
