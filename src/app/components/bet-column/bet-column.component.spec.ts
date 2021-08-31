import { async, ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { BetColumnComponent } from './bet-column.component';

describe('BetColumnComponent', () => {
  let component: BetColumnComponent;
  let fixture: ComponentFixture<BetColumnComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ BetColumnComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BetColumnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
