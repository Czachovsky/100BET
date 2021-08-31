import { async, ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SportsHighlightsComponent } from './sports-highlights.component';

describe('SportsHighlightsComponent', () => {
  let component: SportsHighlightsComponent;
  let fixture: ComponentFixture<SportsHighlightsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ SportsHighlightsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SportsHighlightsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
