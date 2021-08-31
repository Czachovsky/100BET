import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PromotionTermsConditionComponent } from './promotion-terms-condition.component';

describe('PromotionTermsConditionComponent', () => {
  let component: PromotionTermsConditionComponent;
  let fixture: ComponentFixture<PromotionTermsConditionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PromotionTermsConditionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PromotionTermsConditionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
