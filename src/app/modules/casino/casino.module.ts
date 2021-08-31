import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CasinoComponent } from './casino.component';
import {CasinoRoutingModule} from "./casino-routing.module";
import {TranslateLoader, TranslateModule} from "@ngx-translate/core";
import { HttpLoaderFactory, SharedModule } from '../shared/shared.module';
import {HttpClient} from "@angular/common/http";
import { CasinoBannerComponent } from './casino-banner/casino-banner.component';
import { CasinoSortSearchComponent } from './casino-sort-search/casino-sort-search.component';
import { ClickOutsideModule } from 'ng4-click-outside';
import { CasinoGamesComponent } from './casino-games/casino-games.component';
import { CarouselModule } from 'ngx-owl-carousel-o';
import { GameLauncherComponent } from './game-launcher/game-launcher.component';
import { CasinoSearchComponent } from './casino-search/casino-search.component';


@NgModule({
  declarations: [CasinoComponent, CasinoBannerComponent, CasinoSortSearchComponent, CasinoGamesComponent, GameLauncherComponent, CasinoSearchComponent],
  imports: [
    CommonModule,
    CasinoRoutingModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
    SharedModule,
    ClickOutsideModule,
    CarouselModule
  ]
})
export class CasinoModule { }
