import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PickGroupComponent } from './pick-group.component';

describe('PickGroupComponent', () => {
  let component: PickGroupComponent;
  let fixture: ComponentFixture<PickGroupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PickGroupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PickGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
