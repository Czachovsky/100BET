import { async, ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { PopularBetsComponent } from './popular-bets.component';

describe('PopularBetsComponent', () => {
  let component: PopularBetsComponent;
  let fixture: ComponentFixture<PopularBetsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ PopularBetsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PopularBetsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
