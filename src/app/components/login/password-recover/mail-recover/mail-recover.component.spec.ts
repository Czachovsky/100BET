import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MailRecoverComponent } from './mail-recover.component';

describe('MailRecoverComponent', () => {
  let component: MailRecoverComponent;
  let fixture: ComponentFixture<MailRecoverComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MailRecoverComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MailRecoverComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
