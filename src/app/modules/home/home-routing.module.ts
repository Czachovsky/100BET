import { NgModule } from '@angular/core';
import { Routes } from '@angular/router';
import { HomeComponent } from './home.component';
import { RouterModule } from '@angular/router';
import { SportsPageComponent } from './sports-page/sports-page.component';
import { InPlayPageComponent } from './in-play-page/in-play-page.component';
import { FixturesPageComponent } from './fixtures-page/fixtures-page.component';
import { SportsComponent } from './sports/sports.component';
import { SportsAllPageComponent } from './sports-all-page/sports-all-page.component';
import { MyBetsInfoComponent } from './my-bets-info/my-bets-info.component';
import { AuthGuard } from "../../shared/guards/auth.guard";
import { CompetitionsComponent } from './competitions/competitions.component';

export const pagesRoutes: Routes = [
  {
    path: '',
    component: HomeComponent,
    children: [
      {
        path: 'home',
        component: SportsPageComponent,
      },
      {
        path: 'in-play',
        component: SportsAllPageComponent
      },
      {
        path: 'in-play/event-view/:alias/:sportId/:gameId',
        component: SportsAllPageComponent
      },
      {
        path: 'my-bets',
        component: MyBetsInfoComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'markets/:alias/:sportId/:gameId',
        component: InPlayPageComponent,
      },
      {
        path: 'sports/:sport/:country/:competition',
        component: FixturesPageComponent,
      },
      {
        path: ':sport',
        component: SportsComponent,
      },
      {
        path: 'sports/:sport',
        component: SportsAllPageComponent,
      },
      {
        path: ':sport/competitions/:region/:competition',
        redirectTo: ':sport/competitions/:region/:competitionId/match-result',
        pathMatch: 'full'
      },
      {
        path: ':sport/competitions/:region/:competitionId/:tab',
        component: CompetitionsComponent
      }
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(pagesRoutes)],
  exports: [RouterModule],
})
export class HomeRoutingModule {}
