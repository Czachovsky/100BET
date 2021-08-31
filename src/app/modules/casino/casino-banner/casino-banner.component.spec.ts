import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CasinoBannerComponent } from './casino-banner.component';

describe('CasinoBannerComponent', () => {
  let component: CasinoBannerComponent;
  let fixture: ComponentFixture<CasinoBannerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CasinoBannerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CasinoBannerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
