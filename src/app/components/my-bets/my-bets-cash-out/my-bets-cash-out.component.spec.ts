import { async, ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { MyBetsCashOutComponent } from './my-bets-cash-out.component';

describe('MyBetsCashOutComponent', () => {
  let component: MyBetsCashOutComponent;
  let fixture: ComponentFixture<MyBetsCashOutComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ MyBetsCashOutComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MyBetsCashOutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
