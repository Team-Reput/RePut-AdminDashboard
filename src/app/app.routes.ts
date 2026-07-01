// import { Routes } from '@angular/router';
// import { AdminMainComponent } from './admin-main/admin-main.component';
// import { TechnicalDashboardComponent } from './technical-dashboard/technical-dashboard.component';
// import { OverviewDashboardComponent } from './overview-dashboard/overview-dashboard.component';
// import { SalesDashboardComponent } from './sales-dashboard/sales-dashboard.component';
// import { LoginComponent } from './login/login.component';

// export const routes: Routes = [
//     { path: '', redirectTo: 'admin', pathMatch: 'full' },
//     {path:'admin', component: AdminMainComponent,
//     children: [
//       {path: '', redirectTo: 'overview', pathMatch: 'full'},
//       {path: 'technical-dashboard', component: TechnicalDashboardComponent},
//       {path: 'sales-dashboard', component: SalesDashboardComponent},
//       {path: 'overview', component: OverviewDashboardComponent},
//       {path: 'login', component: LoginComponent},

//     ]
//   },
// ];


// src/app/app.routes.ts

import { Routes } from '@angular/router';
import { AdminMainComponent } from './admin-main/admin-main.component';
import { TechnicalDashboardComponent } from './technical-dashboard/technical-dashboard.component';
import { OverviewDashboardComponent } from './overview-dashboard/overview-dashboard.component';
import { SalesDashboardComponent } from './sales-dashboard/sales-dashboard.component';
import { LoginComponent } from './login/login.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'admin/overview', pathMatch: 'full' },  // ← skip login

  { path: 'login', component: LoginComponent },  // ← still exists if needed later

  {
    path: 'admin',
    component: AdminMainComponent,
    canActivate: [authGuard],   // ← comment this out too, so guard doesn't block
    children: [
      { path: '', redirectTo: 'overview', pathMatch: 'full' },
      { path: 'overview', component: OverviewDashboardComponent },
      { path: 'technical-dashboard', component: TechnicalDashboardComponent },
      { path: 'sales-dashboard', component: SalesDashboardComponent },
    ]
  },

  { path: '**', redirectTo: 'admin/overview' }  // ← unknown URLs also go to dashboard
];