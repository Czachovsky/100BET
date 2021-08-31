import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CasinoSortSearchComponent } from './casino-sort-search.component';

describe('CasinoSortSearchComponent', () => {
  let component: CasinoSortSearchComponent;
  let fixture: ComponentFixture<CasinoSortSearchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CasinoSortSearchComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CasinoSortSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
