import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OhbModalComponent } from './ohb-modal.component';

describe('OhbModalComponent', () => {
  let component: OhbModalComponent;
  let fixture: ComponentFixture<OhbModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OhbModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OhbModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
