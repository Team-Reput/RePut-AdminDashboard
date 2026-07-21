import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { SalesService } from '../services/sales.service';
import { TechnicalService } from '../services/technical.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-overview-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './overview-dashboard.component.html',
  styleUrl: './overview-dashboard.component.scss'
})
export class OverviewDashboardComponent implements OnInit {
  username = 'admin_user';
  userRole = '';

  technicalStats = {
    activeUsers: 0,
    apiHits: 0,
    apiLatency: 0,
    networkTraffic: 0
  };

  salesStats = {
    totalCustomers: 0,
    totalOffers: 0,
    expectedRevenue: 0,
    churn: 0
  };

  financialStats = {
    totalRevenue: 0,
    saasRevenue: 0,
    totalExpenses: 0,
    netProfit: 0
  };

  constructor(
    private authService: AuthService,
    private salesService: SalesService,
    private technicalService: TechnicalService
  ) { }

  ngOnInit(): void {
    const user = this.authService.getUser();
    if (!user) return;
    const userId = user.user_id;
    this.username = user.full_name || 'admin_user';
    this.userRole = this.authService.getUserRole();

    // Technical stats: loaded for admin, technical, or monitor roles
    if (this.hasRole('admin', 'technical', 'monitor')) {
      this.technicalService.getStats().subscribe({
        next: (techStats) => {
          this.technicalStats = {
            activeUsers: techStats.activeUsers,
            apiHits: techStats.apiHits,
            apiLatency: techStats.apiLatency,
            networkTraffic: techStats.networkTrafficDown
          };
        },
        error: (err) => {
          console.error('Failed to load technical stats:', err);
        }
      });
    }

    // Sales & Financial stats: loaded for admin, sales, or monitor roles
    if (this.hasRole('admin', 'sales', 'monitor')) {
      forkJoin({
        salesStats: this.salesService.getSalesDashboardSummary(userId),
        financialEntries: this.salesService.getFinancialEntries(userId)
      }).subscribe({
        next: ({ salesStats, financialEntries }) => {
          this.salesStats = salesStats;

          let revenue = 0;
          let saas = 0;
          let marketing = 0;
          let travel = 0;
          let admin = 0;
          let other = 0;

          financialEntries.forEach(e => {
            revenue += Number(e.totalRevenue || 0);
            saas += Number(e.saasRevenue || 0);
            marketing += Number(e.salesMarketingCost || 0);
            travel += Number(e.travelReimbursements || 0);
            admin += Number(e.adminExpenses || 0);
            other += Number(e.otherExpenses || 0);
          });

          const expenses = marketing + travel + admin + other;
          this.financialStats = {
            totalRevenue: revenue,
            saasRevenue: saas,
            totalExpenses: expenses,
            netProfit: revenue - expenses
          };
        },
        error: (err) => {
          console.error('Failed to load sales/financial overview data:', err);
        }
      });
    }
  }

  hasRole(...roles: string[]): boolean {
    return roles.includes(this.userRole);
  }

  logout(): void {
    this.authService.logout();
  }
}

