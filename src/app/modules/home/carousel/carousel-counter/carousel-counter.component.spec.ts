import { async, ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CarouselCounterComponent } from './carousel-counter.component';

describe('CarouselCounterComponent', () => {
  let component: CarouselCounterComponent;
  let fixture: ComponentFixture<CarouselCounterComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ CarouselCounterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CarouselCounterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
