import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { SalesService } from '../services/sales.service';
import { LoadingComponent } from '../loading/loading.component';
import { forkJoin, finalize } from 'rxjs';

@Component({
  selector: 'app-overview-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, LoadingComponent],
  templateUrl: './overview-dashboard.component.html',
  styleUrl: './overview-dashboard.component.scss'
})
export class OverviewDashboardComponent implements OnInit {
  username = 'admin_user';
  isLoading = false;

  technicalStats = {
    activeUsers: 127,
    apiHits: 3298,
    apiLatency: 89.39,
    networkTraffic: 168.82
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
    private salesService: SalesService
  ) { }

  ngOnInit(): void {
    const user = this.authService.getUser();
    if (!user) return;
    const userId = user.user_id;
    this.username = user.full_name || 'admin_user';

    this.isLoading = true;
    forkJoin({
      salesStats: this.salesService.getSalesDashboardSummary(userId),
      financialEntries: this.salesService.getFinancialEntries(userId)
    }).pipe(
      finalize(() => this.isLoading = false)
    ).subscribe({
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
        console.error('Failed to load overview data:', err);
      }
    });
  }

  logout(): void {
    this.authService.logout();
  }
}

