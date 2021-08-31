import { async, ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AllLeaguesComponent } from './all-leagues.component';

describe('AllLeaguesComponent', () => {
  let component: AllLeaguesComponent;
  let fixture: ComponentFixture<AllLeaguesComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AllLeaguesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AllLeaguesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
