import { Routes } from '@angular/router';
import { AdminMainComponent } from './admin-main/admin-main.component';
import { TechnicalDashboardComponent } from './technical-dashboard/technical-dashboard.component';
import { OverviewDashboardComponent } from './overview-dashboard/overview-dashboard.component';
import { SalesDashboardComponent } from './sales-dashboard/sales-dashboard.component';

export const routes: Routes = [
    { path: '', redirectTo: 'admin', pathMatch: 'full' },
    {
    path:'admin', component: AdminMainComponent,
    children: [
      {path: '', redirectTo: 'overview', pathMatch: 'full'},
      {path: 'technical-dashboard', component: TechnicalDashboardComponent},
      {path: 'sales-dashboard', component: SalesDashboardComponent},
      {path: 'overview', component: OverviewDashboardComponent},

    ]
  },
];


