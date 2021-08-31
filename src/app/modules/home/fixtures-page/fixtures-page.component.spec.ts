import { async, ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { FixturesPageComponent } from './fixtures-page.component';

describe('FixturesPageComponent', () => {
  let component: FixturesPageComponent;
  let fixture: ComponentFixture<FixturesPageComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ FixturesPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FixturesPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
