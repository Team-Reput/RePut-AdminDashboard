import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormsModule, Validators, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import * as Highcharts from 'highcharts';
import { HighchartsChartModule } from 'highcharts-angular';
import { SaleslogTableComponent } from './saleslog-table/saleslog-table.component';
import { FinanciallogTableComponent } from './financiallog-table/financiallog-table.component';
import { FinancialChartsComponent } from './financial-charts/financial-charts.component';
import { AuthService } from '../services/auth.service';
import { SalesService } from '../services/sales.service';
import { LoadingComponent } from '../loading/loading.component';
import { forkJoin, finalize } from 'rxjs';

export interface SalesEntry {
  date: string;
  leadStatus: string;
  newCustomers: number;
  offersMade: number;
  expectedRevenue: number;
  churnLostDeals: number;
  pipelineProgress: string;
  obstaclesBlockers: string;
}

export interface FinancialEntry {
  month: string;
  year: string;
  startDate: string;
  endDate: string;
  totalRevenue: number;
  saasRevenue: number;
  salesMarketingCost: number;
  travelReimbursements: number;
  adminExpenses: number;
  otherExpenses: number;
}

@Component({
  selector: 'app-sales-dashboard',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    ReactiveFormsModule, 
    HighchartsChartModule, 
    SaleslogTableComponent, 
    FinanciallogTableComponent,
    FinancialChartsComponent,
    LoadingComponent
  ],
  templateUrl: './sales-dashboard.component.html',
  styleUrl: './sales-dashboard.component.scss'
})
export class SalesDashboardComponent {
  username = 'admin_user';
  isLoading = false;
  isFormVisible: boolean = false;
  salesForm!: FormGroup;
  isSalesFormVisible: boolean = false;
  financialForm!: FormGroup;
  dashboardMode: 'sales' | 'financial' = 'sales';


  salesStats = {
    totalCustomers: 5,
    totalOffers: 8,
    expectedRevenue: 50000,
    churn: 1
  };

  Highcharts = Highcharts;  // Highcharts instance
  revenueCustomerTrendsChartOptions: any;
  pipelineStatusBreakdownChartOptions: any;

  activeTab: 'overview' | 'financialform' | 'salesform' = 'overview';

  // Toggle State
  activeTable: 'sales' | 'financial' = 'sales';

  // Initial Demo Data
  salesEntries: SalesEntry[] = [
    { date: '2026-07-01', leadStatus: 'closed-won', newCustomers: 2, offersMade: 3, expectedRevenue: 12000, churnLostDeals: 0, pipelineProgress: 'Finalized onboarding and kickoff meetings', obstaclesBlockers: 'None' },
    { date: '2026-07-05', leadStatus: 'proposal', newCustomers: 0, offersMade: 2, expectedRevenue: 8500, churnLostDeals: 0, pipelineProgress: 'Draft proposal submitted for evaluation', obstaclesBlockers: 'Client delaying response' },
    { date: '2026-07-08', leadStatus: 'negotiation', newCustomers: 1, offersMade: 1, expectedRevenue: 9500, churnLostDeals: 0, pipelineProgress: 'Contract terms renegotiation phase', obstaclesBlockers: 'Legal team reviewing clauses' },
    { date: '2026-07-10', leadStatus: 'closed-lost', newCustomers: 0, offersMade: 1, expectedRevenue: 0, churnLostDeals: 1, pipelineProgress: 'Competitor selected due to lower pricing tier', obstaclesBlockers: 'High price friction' },
    { date: '2026-07-12', leadStatus: 'in-talks', newCustomers: 0, offersMade: 1, expectedRevenue: 20000, churnLostDeals: 0, pipelineProgress: 'Initial call completed with promising feedback', obstaclesBlockers: 'None' }
  ];

  financialEntries: FinancialEntry[] = [
    { month: 'January', year: '2026', startDate: '2026-01-01', endDate: '2026-01-31', totalRevenue: 15000, saasRevenue: 10000, salesMarketingCost: 3500, travelReimbursements: 500, adminExpenses: 1200, otherExpenses: 300 },
    { month: 'February', year: '2026', startDate: '2026-02-01', endDate: '2026-02-28', totalRevenue: 18000, saasRevenue: 12000, salesMarketingCost: 4000, travelReimbursements: 600, adminExpenses: 1200, otherExpenses: 400 },
    { month: 'March', year: '2026', startDate: '2026-03-01', endDate: '2026-03-31', totalRevenue: 22000, saasRevenue: 15000, salesMarketingCost: 4200, travelReimbursements: 800, adminExpenses: 1500, otherExpenses: 500 },
    { month: 'April', year: '2026', startDate: '2026-04-01', endDate: '2026-04-30', totalRevenue: 20000, saasRevenue: 13000, salesMarketingCost: 3800, travelReimbursements: 400, adminExpenses: 1300, otherExpenses: 200 },
    { month: 'May', year: '2026', startDate: '2026-05-01', endDate: '2026-05-31', totalRevenue: 26000, saasRevenue: 18000, salesMarketingCost: 4500, travelReimbursements: 700, adminExpenses: 1600, otherExpenses: 600 }
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private salesService: SalesService
  ) { }

  ngOnInit(): void {
    this.financialForm = this.fb.group({
      month: ['', Validators.required],
      year: ['2026', Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      totalRevenue: ['', Validators.required],
      saasRevenue: ['', Validators.required],
      salesMarketingCost: ['', Validators.required],
      travelReimbursements: ['', Validators.required],
      adminExpenses: ['', Validators.required],
      otherExpenses: ['', Validators.required]
    });

    this.salesForm = this.fb.group({
      date: [this.getTodayDate(), Validators.required],
      leadStatus: ['in-talks', Validators.required],
      newCustomers: [0, [Validators.required, Validators.min(0)]],
      offersMade: [0, [Validators.required, Validators.min(0)]],
      expectedRevenue: [0, [Validators.required, Validators.min(0)]],
      churnLostDeals: [0, [Validators.required, Validators.min(0)]],
      pipelineProgress: [''],
      obstaclesBlockers: ['']
    });

    this.loadDashboardData();
  }

  loadDashboardData() {
    const user = this.authService.getUser();
    if (!user) return;
    const userId = user.user_id;

    this.isLoading = true;
    forkJoin({
      salesEntries: this.salesService.getSalesEntries(userId),
      financialEntries: this.salesService.getFinancialEntries(userId),
      salesStats: this.salesService.getSalesDashboardSummary(userId)
    }).pipe(
      finalize(() => this.isLoading = false)
    ).subscribe({
      next: ({ salesEntries, financialEntries, salesStats }) => {
        this.salesEntries = salesEntries.map(e => ({
          date: e.date,
          leadStatus: e.leadStatus,
          newCustomers: e.newCustomers,
          offersMade: e.offersMade,
          expectedRevenue: e.expectedRevenue,
          churnLostDeals: e.churnLostDeals,
          pipelineProgress: e.pipelineProgress,
          obstaclesBlockers: e.obstaclesBlockers
        }));
        this.setRevenueCustomerTrendsChart();
        this.setPipelineStatusBreakdownChart();

        this.financialEntries = financialEntries.map(e => ({
          month: e.month,
          year: e.year,
          startDate: e.startDate,
          endDate: e.endDate,
          totalRevenue: e.totalRevenue,
          saasRevenue: e.saasRevenue,
          salesMarketingCost: e.salesMarketingCost,
          travelReimbursements: e.travelReimbursements,
          adminExpenses: e.adminExpenses,
          otherExpenses: e.otherExpenses || 0
        }));

        this.salesStats = salesStats;
      },
      error: (err) => {
        console.error('Failed to load sales dashboard data:', err);
        this.recalculateSalesStats();
      }
    });
  }

  recalculateSalesStats() {
    let customers = 0;
    let offers = 0;
    let revenue = 0;
    let churn = 0;

    this.salesEntries.forEach(entry => {
      customers += entry.newCustomers;
      offers += entry.offersMade;
      revenue += entry.expectedRevenue;
      churn += entry.churnLostDeals;
    });

    this.salesStats = {
      totalCustomers: customers,
      totalOffers: offers,
      expectedRevenue: revenue,
      churn: churn
    };
  }

  get financialStats() {
    let revenue = 0;
    let saas = 0;
    let marketing = 0;
    let travel = 0;
    let admin = 0;
    let other = 0;

    this.financialEntries.forEach(e => {
      revenue += Number(e.totalRevenue || 0);
      saas += Number(e.saasRevenue || 0);
      marketing += Number(e.salesMarketingCost || 0);
      travel += Number(e.travelReimbursements || 0);
      admin += Number(e.adminExpenses || 0);
      other += Number(e.otherExpenses || 0);
    });

    const expenses = marketing + travel + admin + other;
    return {
      totalRevenue: revenue,
      saasRevenue: saas,
      totalExpenses: expenses,
      netProfit: revenue - expenses
    };
  }

  setDashboardMode(mode: 'sales' | 'financial') {
    this.dashboardMode = mode;
    this.activeTable = mode;
  }


  logout(): void {
    this.authService.logout();
  }

  openFinancialForm() {
    this.isFormVisible = true;
  }

  closeFinancialForm() {
    this.isFormVisible = false;
  }

  openSalesForm() {
    this.isSalesFormVisible = true;
  }

  closeModal() {
    this.isSalesFormVisible = false;
  }

  submitForm() {
    if (this.financialForm.valid) {
      const formData = this.financialForm.value;
      const newEntry: FinancialEntry = {
        month: formData.month,
        year: formData.year,
        startDate: formData.startDate,
        endDate: formData.endDate,
        totalRevenue: Number(formData.totalRevenue || 0),
        saasRevenue: Number(formData.saasRevenue || 0),
        salesMarketingCost: Number(formData.salesMarketingCost || 0),
        travelReimbursements: Number(formData.travelReimbursements || 0),
        adminExpenses: Number(formData.adminExpenses || 0),
        otherExpenses: Number(formData.otherExpenses || 0)
      };

      const user = this.authService.getUser();
      if (user) {
        this.salesService.insertFinancialEntry(newEntry, user.user_id).subscribe({
          next: (res) => {
            if (res.success) {
              this.loadDashboardData();
            }
          },
          error: (err) => console.error('Failed to insert financial entry:', err)
        });
      }
      
      this.closeFinancialForm();
      this.financialForm.reset({
        month: '',
        year: '2026',
        startDate: '',
        endDate: '',
        totalRevenue: '',
        saasRevenue: '',
        salesMarketingCost: '',
        travelReimbursements: '',
        adminExpenses: '',
        otherExpenses: ''
      });
    }
  }

  onSubmit() {
    if (this.salesForm.valid) {
      const formData = this.salesForm.value;
      const newEntry: SalesEntry = {
        date: formData.date,
        leadStatus: formData.leadStatus,
        newCustomers: Number(formData.newCustomers || 0),
        offersMade: Number(formData.offersMade || 0),
        expectedRevenue: Number(formData.expectedRevenue || 0),
        churnLostDeals: Number(formData.churnLostDeals || 0),
        pipelineProgress: formData.pipelineProgress || 'No progress notes.',
        obstaclesBlockers: formData.obstaclesBlockers || 'None'
      };

      const user = this.authService.getUser();
      if (user) {
        this.salesService.insertSalesEntry(newEntry, user.user_id).subscribe({
          next: (res) => {
            if (res.success) {
              this.loadDashboardData();
            }
          },
          error: (err) => console.error('Failed to insert sales entry:', err)
        });
      }

      this.closeModal();
      this.salesForm.reset({
        date: this.getTodayDate(),
        leadStatus: 'in-talks',
        newCustomers: 0,
        offersMade: 0,
        expectedRevenue: 0,
        churnLostDeals: 0,
        pipelineProgress: '',
        obstaclesBlockers: ''
      });
    }
  }

  // Get today's date to prefill the date field
  getTodayDate() {
    const today = new Date();
    return today.toISOString().split('T')[0]; // Return date in YYYY-MM-DD format
  }

  setRevenueCustomerTrendsChart() {
    // Sort sales entries chronologically
    const sortedEntries = [...this.salesEntries].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    const categories = sortedEntries.map(e => e.date);
    const expectedRevenueData = sortedEntries.map(e => e.expectedRevenue);
    const newCustomersData = sortedEntries.map(e => e.newCustomers);

    this.revenueCustomerTrendsChartOptions = {
      chart: {
        type: 'line',
      },
      title: {
        text: null
      },
      xAxis: {
        categories: categories,
        title: {
          text: 'Entry Date'
        }
      },
      yAxis: {
        title: {
          text: 'Value'
        }
      },
      series: [
        {
          name: 'Expected Revenue ($)',
          type: 'line',
          data: expectedRevenueData,
          color: '#8e44ad',
          lineWidth: 2,
          marker: {
            enabled: true,
            symbol: 'diamond',
            radius: 6
          }
        },
        {
          name: 'New Customers',
          type: 'line',
          data: newCustomersData,
          color: '#1abc9c',
          lineWidth: 2,
          marker: {
            enabled: true,
            symbol: 'circle',
            radius: 6
          }
        }
      ]
    };
  }

  setPipelineStatusBreakdownChart() {
    const statusCounts: { [key: string]: number } = {
      'in-talks': 0,
      'qualified': 0,
      'proposal': 0,
      'negotiation': 0,
      'closed-won': 0,
      'closed-lost': 0
    };

    this.salesEntries.forEach(e => {
      if (statusCounts[e.leadStatus] !== undefined) {
        statusCounts[e.leadStatus]++;
      } else {
        statusCounts[e.leadStatus] = 1;
      }
    });

    const chartData = Object.keys(statusCounts)
      .filter(status => statusCounts[status] > 0)
      .map(status => {
        const nameMap: { [key: string]: string } = {
          'in-talks': 'In Talks',
          'qualified': 'Qualified',
          'proposal': 'Proposal Sent',
          'negotiation': 'Negotiation',
          'closed-won': 'Closed Won',
          'closed-lost': 'Closed Lost'
        };
        const colorMap: { [key: string]: string } = {
          'in-talks': '#f39c12',
          'qualified': '#3498db',
          'proposal': '#9b59b6',
          'negotiation': '#e67e22',
          'closed-won': '#2ecc71',
          'closed-lost': '#e74c3c'
        };

        return {
          name: nameMap[status] || status,
          y: statusCounts[status],
          color: colorMap[status] || '#9b4dff'
        };
      });

    this.pipelineStatusBreakdownChartOptions = {
      chart: {
        type: 'pie'
      },
      title: {
        text: null
      },
      subtitle: {
        text: null
      },
      series: [{
        name: 'Leads Status',
        colorByPoint: true,
        data: chartData
      }]
    };
  }
}
