import { async, ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { LeftColumnNavComponent } from './left-column-nav.component';

describe('LeftColumnNavComponent', () => {
  let component: LeftColumnNavComponent;
  let fixture: ComponentFixture<LeftColumnNavComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ LeftColumnNavComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LeftColumnNavComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
