import { async, ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SportsPageComponent } from './sports-page.component';

describe('SportsPageComponent', () => {
  let component: SportsPageComponent;
  let fixture: ComponentFixture<SportsPageComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ SportsPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SportsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
