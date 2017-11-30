import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import {PortfolioComponent} from './portfolio/portfolio.component';

const routes: Routes = [
    {
      path: '',
      component: DashboardComponent
    },
    {
      path: 'portfolio/:id',
      component: PortfolioComponent
    }
  ];

  @NgModule({
    imports: [
      RouterModule.forRoot(routes, { useHash: true }) //, { useHash: true }
    ],
    exports: [RouterModule]
  })
  export class AppRoutingModule { }