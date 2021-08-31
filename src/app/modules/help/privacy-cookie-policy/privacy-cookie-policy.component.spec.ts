import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrivacyCookiePolicyComponent } from './privacy-cookie-policy.component';

describe('PrivacyCookiePolicyComponent', () => {
  let component: PrivacyCookiePolicyComponent;
  let fixture: ComponentFixture<PrivacyCookiePolicyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PrivacyCookiePolicyComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PrivacyCookiePolicyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
