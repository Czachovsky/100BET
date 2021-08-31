import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DailyMatchesTablesComponent } from './daily-matches-tables.component';

describe('DailyMatchesTablesComponent', () => {
  let component: DailyMatchesTablesComponent;
  let fixture: ComponentFixture<DailyMatchesTablesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DailyMatchesTablesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DailyMatchesTablesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
