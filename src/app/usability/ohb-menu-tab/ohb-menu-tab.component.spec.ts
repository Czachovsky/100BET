import { async, ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { OhbMenuTabComponent } from './ohb-menu-tab.component';

describe('OhbMenuTabComponent', () => {
  let component: OhbMenuTabComponent;
  let fixture: ComponentFixture<OhbMenuTabComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ OhbMenuTabComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OhbMenuTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
