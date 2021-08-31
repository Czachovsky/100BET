import { async, ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { StakeNumpadComponent } from './stake-numpad.component';

describe('StakeNumpadComponent', () => {
  let component: StakeNumpadComponent;
  let fixture: ComponentFixture<StakeNumpadComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ StakeNumpadComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StakeNumpadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
