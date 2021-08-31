import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PromotionSportsComponent } from './promotion-sports.component';

describe('PromotionSportsComponent', () => {
  let component: PromotionSportsComponent;
  let fixture: ComponentFixture<PromotionSportsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PromotionSportsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PromotionSportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
