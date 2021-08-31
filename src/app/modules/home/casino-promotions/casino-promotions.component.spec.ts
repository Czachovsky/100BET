import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CasinoPromotionsComponent } from './casino-promotions.component';

describe('CasinoPromotionsComponent', () => {
  let component: CasinoPromotionsComponent;
  let fixture: ComponentFixture<CasinoPromotionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CasinoPromotionsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CasinoPromotionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
