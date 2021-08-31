import { async, ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { MyBetsComponent } from './my-bets.component';

describe('MyBetsComponent', () => {
  let component: MyBetsComponent;
  let fixture: ComponentFixture<MyBetsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ MyBetsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MyBetsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
