import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PromotionComponent } from './promotion.component';
import { PromotionRoutingModule } from './promotion-routing.module';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { HttpLoaderFactory, SharedModule } from '../shared/shared.module';
import { HttpClient } from '@angular/common/http';
import { MatTabsModule } from '@angular/material/tabs';
import { PromotionTermsConditionComponent } from './promotion-terms-condition/promotion-terms-condition.component';
import { MatExpansionModule } from '@angular/material/expansion';

@NgModule({
  declarations: [PromotionComponent, PromotionTermsConditionComponent],
  imports: [
    CommonModule,
    PromotionRoutingModule,
    SharedModule,
    MatTabsModule,
    MatExpansionModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient],
      },
    }),
  ],
})
export class PromotionModule {}
