import { async, ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { InPlayPageComponent } from './in-play-page.component';

describe('InPlayPageComponent', () => {
  let component: InPlayPageComponent;
  let fixture: ComponentFixture<InPlayPageComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ InPlayPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InPlayPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
