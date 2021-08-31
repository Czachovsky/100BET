import { async, ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { MyBetsAllComponent } from './my-bets-all.component';

describe('MyBetsAllComponent', () => {
  let component: MyBetsAllComponent;
  let fixture: ComponentFixture<MyBetsAllComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ MyBetsAllComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MyBetsAllComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
