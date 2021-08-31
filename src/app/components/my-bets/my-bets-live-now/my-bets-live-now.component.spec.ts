import { async, ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { MyBetsLiveNowComponent } from './my-bets-live-now.component';

describe('MyBetsLiveNowComponent', () => {
  let component: MyBetsLiveNowComponent;
  let fixture: ComponentFixture<MyBetsLiveNowComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ MyBetsLiveNowComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MyBetsLiveNowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
