import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NumpadSmallComponent } from './numpad-small.component';

describe('NumpadSmallComponent', () => {
  let component: NumpadSmallComponent;
  let fixture: ComponentFixture<NumpadSmallComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NumpadSmallComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NumpadSmallComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
