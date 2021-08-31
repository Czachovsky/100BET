import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HelpComponent } from './help.component';
import { HelpComponent as HelpContentComponent } from './help/help.component';

import { HelpRoutingModule } from './help-routing.module';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from '../shared/shared.module';
import { HelpExpansionPanelComponent } from './help-expansion-panel/help-expansion-panel.component';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { BettingRulesComponent } from './betting-rules/betting-rules.component';
import { ComplaintsProcedureComponent } from './complaints-procedure/complaints-procedure.component';
import { ContactUsComponent } from './contact-us/contact-us.component';
import { PrivacyCookiePolicyComponent } from './privacy-cookie-policy/privacy-cookie-policy.component';
import { ResponsibleGamblingComponent } from './responsible-gambling/responsible-gambling.component';
import { TermsConditionsComponent } from './terms-conditions/terms-conditions.component';
import { AboutUsComponent } from './about-us/about-us.component';
import { AffiliatesComponent } from './affiliates/affiliates.component';

@NgModule({
  declarations: [
    HelpComponent,
    HelpExpansionPanelComponent,
    BettingRulesComponent,
    ComplaintsProcedureComponent,
    ContactUsComponent,
    PrivacyCookiePolicyComponent,
    ResponsibleGamblingComponent,
    HelpContentComponent,
    TermsConditionsComponent,
    AboutUsComponent,
    AffiliatesComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    HelpRoutingModule,
    MatExpansionModule,
    MatIconModule,
    TranslateModule
  ]
})
export class HelpModule { }
