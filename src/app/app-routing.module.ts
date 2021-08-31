import {RouterModule, Routes} from "@angular/router";
import {NgModule} from "@angular/core";
import { AuthGuard } from "./shared/guards/auth.guard";

const routes: Routes = [
  {
    path: '',
    redirectTo: '/sportsbook/home',
    pathMatch: 'full'
  },
  {
    path: 'sportsbook',
    loadChildren: () => import('./modules/home/home.module').then(m =>  m.HomeModule)
  },
  {
    path: 'casino',
    loadChildren: () => import('./modules/casino/casino.module').then(m => m.CasinoModule)
  },
  {
    path: 'dashboard',
    loadChildren: () => import('./modules/dashboard/dashboard.module').then(m => m.DashboardModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'help',
    loadChildren: () => import('./modules/help/help.module').then(m => m.HelpModule)
  },
  {
    path: 'promotion',
    loadChildren: () => import('./modules/promotion/promotion.module').then(m => m.PromotionModule)
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
