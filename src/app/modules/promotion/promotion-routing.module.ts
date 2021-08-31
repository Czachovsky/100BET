import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PromotionTermsConditionComponent } from './promotion-terms-condition/promotion-terms-condition.component';
import { PromotionComponent } from './promotion.component';

export const pagesRoutes: Routes = [
  {
    path: '',
    component: PromotionComponent,
  },
  {
    path: 'terms-condition/:id',
    component: PromotionTermsConditionComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(pagesRoutes)],
  exports: [RouterModule],
})
export class PromotionRoutingModule {}
