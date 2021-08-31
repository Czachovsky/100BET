import { async, ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CasinoComponent } from './casino.component';

describe('CasinoComponent', () => {
  let component: CasinoComponent;
  let fixture: ComponentFixture<CasinoComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ CasinoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CasinoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
