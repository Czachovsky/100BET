import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HelpExpansionPanelComponent } from './help-expansion-panel.component';

describe('HelpExpansionPanelComponent', () => {
  let component: HelpExpansionPanelComponent;
  let fixture: ComponentFixture<HelpExpansionPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HelpExpansionPanelComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HelpExpansionPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
