import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SortsbookComponent } from './sortsbook.component';

describe('SortsbookComponent', () => {
  let component: SortsbookComponent;
  let fixture: ComponentFixture<SortsbookComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SortsbookComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SortsbookComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
