import { NgModule } from '@angular/core';
import {RouterModule, Routes} from "@angular/router";
import {CasinoComponent} from "./casino.component";

export const pagesRoutes: Routes = [
  {
    path:'',
    component: CasinoComponent
  }
]

@NgModule({
  imports: [RouterModule.forChild(pagesRoutes)],
  exports: [RouterModule]
})
export class CasinoRoutingModule { }
