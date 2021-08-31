import { async, ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { MyBetsUnsettledComponent } from './my-bets-unsettled.component';

describe('MyBetsUnsettledComponent', () => {
  let component: MyBetsUnsettledComponent;
  let fixture: ComponentFixture<MyBetsUnsettledComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ MyBetsUnsettledComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MyBetsUnsettledComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
