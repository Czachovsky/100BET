import { async, ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { OhbSelectComponent } from './ohb-select.component';

describe('OhbSelectComponent', () => {
  let component: OhbSelectComponent;
  let fixture: ComponentFixture<OhbSelectComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ OhbSelectComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OhbSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
