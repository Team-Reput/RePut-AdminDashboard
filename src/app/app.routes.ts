// src/app/app.routes.ts

import { Routes } from '@angular/router';
import { AdminMainComponent } from './admin-main/admin-main.component';
import { TechnicalDashboardComponent } from './technical-dashboard/technical-dashboard.component';
import { OverviewDashboardComponent } from './overview-dashboard/overview-dashboard.component';
import { SalesDashboardComponent } from './sales-dashboard/sales-dashboard.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { ChartGeneratorComponent } from './chart-generator/chart-generator.component';
import { authGuard } from './guards/auth.guard';
import { roleGuard } from './guards/role.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },

  {
    path: 'admin',
    component: AdminMainComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'overview', pathMatch: 'full' },
      { path: 'overview', component: OverviewDashboardComponent },
      {
        path: 'technical-dashboard',
        component: TechnicalDashboardComponent,
        canActivate: [roleGuard],
        data: { roles: ['admin', 'technical', 'monitor'] }
      },
      {
        path: 'sales-dashboard',
        component: SalesDashboardComponent,
        canActivate: [roleGuard],
        data: { roles: ['admin', 'sales', 'monitor'], mode: 'sales' }
      },
      {
        path: 'financial-dashboard',
        component: SalesDashboardComponent,
        canActivate: [roleGuard],
        data: { roles: ['admin', 'sales', 'monitor'], mode: 'financial' }
      },
      {
        path: 'charts',
        component: ChartGeneratorComponent,
        canActivate: [roleGuard],
        data: { roles: ['admin', 'monitor'] }
      }
    ]
  },

  { path: '**', redirectTo: 'login' }
];