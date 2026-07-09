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
import { RegisterComponent } from './register/register.component';
import { authGuard } from './guards/auth.guard';

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
      { path: 'technical-dashboard', component: TechnicalDashboardComponent },
      { path: 'sales-dashboard', component: SalesDashboardComponent },
    ]
  },

  { path: '**', redirectTo: 'login' }
];