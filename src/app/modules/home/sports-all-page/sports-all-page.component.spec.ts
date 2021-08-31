import { async, ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SportsAllPageComponent } from './sports-all-page.component';

describe('SportsAllPageComponent', () => {
  let component: SportsAllPageComponent;
  let fixture: ComponentFixture<SportsAllPageComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ SportsAllPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SportsAllPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
