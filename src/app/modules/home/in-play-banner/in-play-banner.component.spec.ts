import { async, ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { InPlayBannerComponent } from './in-play-banner.component';

describe('InPlayBannerComponent', () => {
  let component: InPlayBannerComponent;
  let fixture: ComponentFixture<InPlayBannerComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ InPlayBannerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InPlayBannerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
