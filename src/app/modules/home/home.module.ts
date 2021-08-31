import {NgModule} from '@angular/core';
import {CommonModule, DatePipe} from '@angular/common';
import {HomeComponent} from './home.component';
import {HomeRoutingModule} from './home-routing.module';
import {HttpLoaderFactory, SharedModule} from '../shared/shared.module';
import {CarouselComponent} from './carousel/carousel.component';
import {FeaturedComponent} from './featured/featured.component'
import {CarouselModule} from "ngx-owl-carousel-o";
import { CarouselCounterComponent } from './carousel/carousel-counter/carousel-counter.component';
import { InPlayComponent } from './in-play/in-play.component';
import { PopularBetsComponent } from './popular-bets/popular-bets.component';
import { SportsPageComponent } from './sports-page/sports-page.component';
import { InPlayPageComponent } from './in-play-page/in-play-page.component';
import {TranslateLoader, TranslateModule} from "@ngx-translate/core";
import {HttpClient} from "@angular/common/http";
import { UpcomingComponent } from './upcoming/upcoming.component';
import { CasinoGamesComponent } from './casino-games/casino-games.component';
import { MatchResultsComponent } from './match-results/match-results.component';
import { TotalGoalsComponent } from './total-goals/total-goals.component';
import { AsianHandicapComponent } from './asian-handicap/asian-handicap.component';
import { InPlayBannerComponent } from './in-play-banner/in-play-banner.component';
import { FixturesPageComponent } from './fixtures-page/fixtures-page.component';
import { FixturesMatchesComponent } from './fixtures-page/fixtures-matches/fixtures-matches.component';
import { FixturesOutrightsComponent } from './fixtures-page/fixtures-outrights/fixtures-outrights.component';
import { FixturesStandingsComponent } from './fixtures-page/fixtures-standings/fixtures-standings.component';
import { SportsComponent } from './sports/sports.component';
import { DailyMatchesComponent } from './sports/daily-matches/daily-matches.component';
import { AllLeaguesComponent } from './sports/all-leagues/all-leagues.component';
import { SportsHighlightsComponent } from './sports/sports-highlights/sports-highlights.component';
import { SportsLiveComponent } from './sports/sports-live/sports-live.component';
import { SportsAllPageComponent } from './sports-all-page/sports-all-page.component';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import { CasinoPromotionsComponent } from './casino-promotions/casino-promotions.component';
import { DailyMatchesTablesComponent } from './sports/daily-matches/daily-matches-tables/daily-matches-tables.component';
import { MyBetsInfoComponent } from './my-bets-info/my-bets-info.component';
import { PickGroupComponent } from './pick-group/pick-group.component';
import { CompetitionsComponent } from './competitions/competitions.component';
import { CompetitionStandingsComponent } from './competitions/competition-standings/competition-standings.component';
import { CompetitionOutrightsComponent } from './competitions/competition-outrights/competition-outrights.component';
import { CompetitionMatchesComponent } from './competitions/competition-matches/competition-matches.component';
import { ClickOutsideModule } from 'ng4-click-outside';

@NgModule({
  declarations: [
    HomeComponent,
    CarouselComponent,
    FeaturedComponent,
    CarouselCounterComponent,
    InPlayComponent,
    PopularBetsComponent,
    SportsPageComponent,
    InPlayPageComponent,
    UpcomingComponent,
    CasinoGamesComponent,
    MatchResultsComponent,
    TotalGoalsComponent,
    AsianHandicapComponent,
    InPlayBannerComponent,
    FixturesPageComponent,
    FixturesMatchesComponent,
    FixturesOutrightsComponent,
    FixturesStandingsComponent,
    SportsComponent,
    DailyMatchesComponent,
    AllLeaguesComponent,
    SportsHighlightsComponent,
    SportsLiveComponent,
    SportsAllPageComponent,
    CasinoPromotionsComponent,
    DailyMatchesTablesComponent,
    MyBetsInfoComponent,
    PickGroupComponent,
    CompetitionsComponent,
    CompetitionStandingsComponent,
    CompetitionOutrightsComponent,
    CompetitionMatchesComponent
  ],
  imports: [
    CommonModule,
    HomeRoutingModule,
    SharedModule,
    CarouselModule,
    MatAutocompleteModule,
    TranslateModule,
    ClickOutsideModule
  ],
  exports: [
    CasinoGamesComponent
  ],
  providers: [DatePipe]
})
export class HomeModule {
}
