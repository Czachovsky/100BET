import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HelpComponent } from './help.component';
import { HelpComponent as HelpContentComponent } from './help/help.component';

import { ContactUsComponent } from './contact-us/contact-us.component';
import { TermsConditionsComponent } from './terms-conditions/terms-conditions.component';
import { ComplaintsProcedureComponent } from './complaints-procedure/complaints-procedure.component';
import { BettingRulesComponent } from './betting-rules/betting-rules.component';
import { PrivacyCookiePolicyComponent } from './privacy-cookie-policy/privacy-cookie-policy.component';
import { ResponsibleGamblingComponent } from './responsible-gambling/responsible-gambling.component';
import { AboutUsComponent } from './about-us/about-us.component';
import { AffiliatesComponent } from './affiliates/affiliates.component';

export const pagesRoutes: Routes = [
  {
    path: '',
    component: HelpComponent,
    children: [
      {
        path: '',
        component: HelpContentComponent
      },
      {
        path: 'main',
        component: HelpContentComponent
      },
      {
        path: 'contact-us',
        component: ContactUsComponent
      },
      {
        path: 'terms-conditions',
        component: TermsConditionsComponent
      },
      {
        path: 'responsible-gambling',
        component: ResponsibleGamblingComponent
      },
      {
        path: 'privacy-cookie-policy',
        component: PrivacyCookiePolicyComponent
      },
      {
        path: 'betting-rules',
        component: BettingRulesComponent
      },
      {
        path: 'complaints-procedure',
        component: ComplaintsProcedureComponent
      },
      {
        path: 'about-us',
        component: AboutUsComponent
      },
      {
        path: 'affiliates',
        component: AffiliatesComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(pagesRoutes)],
  exports: [RouterModule]
})
export class HelpRoutingModule {
}
