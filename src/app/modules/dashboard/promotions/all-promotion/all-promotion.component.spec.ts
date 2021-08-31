import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllPromotionComponent } from './all-promotion.component';

describe('AllPromotionComponent', () => {
  let component: AllPromotionComponent;
  let fixture: ComponentFixture<AllPromotionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AllPromotionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AllPromotionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
