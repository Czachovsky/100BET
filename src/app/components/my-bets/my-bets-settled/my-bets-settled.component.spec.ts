import { async, ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { MyBetsSettledComponent } from './my-bets-settled.component';

describe('MyBetsSettledComponent', () => {
  let component: MyBetsSettledComponent;
  let fixture: ComponentFixture<MyBetsSettledComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ MyBetsSettledComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MyBetsSettledComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
