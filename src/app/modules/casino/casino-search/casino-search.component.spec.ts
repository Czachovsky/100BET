import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CasinoSearchComponent } from './casino-search.component';

describe('CasinoSearchComponent', () => {
  let component: CasinoSearchComponent;
  let fixture: ComponentFixture<CasinoSearchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CasinoSearchComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CasinoSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
