import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormsModule, Validators, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import * as Highcharts from 'highcharts';
import { HighchartsChartModule } from 'highcharts-angular';
@Component({
  selector: 'app-sales-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, HighchartsChartModule],
  templateUrl: './sales-dashboard.component.html',
  styleUrl: './sales-dashboard.component.scss'
})
export class SalesDashboardComponent {
  username = 'admin_user';
  isFormVisible: boolean = false;
    salesForm!: FormGroup;
  isSalesFormVisible: boolean = false;
  financialForm!: FormGroup;
  salesStats = {
    totalCustomers: 5,
    totalOffers: 8,
    expectedRevenue: 50000,
    churn: 1
  };
    Highcharts = Highcharts;  // Highcharts instance
  revenueCustomerTrendsChartOptions: any;
  pipelineStatusBreakdownChartOptions: any;

  constructor(private fb: FormBuilder, private router: Router) { }
  activeTab: 'overview' | 'financialform' | 'salesform' = 'overview';
  ngOnInit(): void {
    this.financialForm = this.fb.group({
      month: ['', Validators.required],
      year: ['2025', Validators.required],
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

        this.setRevenueCustomerTrendsChart();
    this.setPipelineStatusBreakdownChart();
  }

  logout(): void {
    console.log('Logout clicked');
  }

   openFinancialForm() {
    this.isFormVisible = true;
  }

  // Close the form (hide popup)
  closeFinancialForm() {
    this.isFormVisible = false;
  }

  openSalesForm() {
    this.isSalesFormVisible = true;
  }

  // Close Sales Form Modal
  closeModal() {
    this.isSalesFormVisible = false;
  }

  // Submit form data
  submitForm() {
    if (this.financialForm.valid) {
      const formData = this.financialForm.value;
      console.log('Form Submitted', formData);
      this.closeFinancialForm(); // Close the form after submission
    }
  }

  onSubmit() {
    if (this.salesForm.valid) {
      const formData = this.salesForm.value;
      console.log('Sales Form Submitted', formData);
      this.closeModal(); // Close the form after submission
    }
  }

  // Get today's date to prefill the date field
  getTodayDate() {
    const today = new Date();
    return today.toISOString().split('T')[0]; // Return date in YYYY-MM-DD format
  }

    setRevenueCustomerTrendsChart() {
    this.revenueCustomerTrendsChartOptions = {
      chart: {
        type: 'scatter',
        zoomType: 'xy'
      },
      title: {
        text: 'Revenue & Customer Trends'
      },
      subtitle: {
        text: 'Expected revenue and new customers over time'
      },
      xAxis: {
        title: {
          enabled: true,
          text: 'Time'
        },
        categories: ['Month 1', 'Month 2', 'Month 3', 'Month 4', 'Month 5']  // Replace with actual data points
      },
      yAxis: {
        title: {
          text: 'Value'
        },
        min: 0
      },
      series: [{
        name: 'New Customers',
        color: '#00bcd4',
        data: [
          [0, 10], [1, 15], [2, 12], [3, 18], [4, 22]  // Replace with actual new customer data
        ],
        marker: {
          radius: 5
        }
      }, {
        name: 'Revenue ($)',
        color: '#9b4dff',
        data: [
          [0, 2000], [1, 2500], [2, 2200], [3, 2700], [4, 3000]  // Replace with actual revenue data
        ],
        marker: {
          radius: 5
        }
      }],
      legend: {
        layout: 'vertical',
        align: 'right',
        verticalAlign: 'top'
      }
    };
  }

  // Function to set up the pie chart for Pipeline Status Breakdown
  setPipelineStatusBreakdownChart() {
    this.pipelineStatusBreakdownChartOptions = {
      chart: {
        type: 'pie'
      },
      title: {
        text: 'Pipeline Status Breakdown'
      },
      subtitle: {
        text: 'Distribution of leads by status'
      },
      series: [{
        name: 'Leads Status',
        colorByPoint: true,
        data: [{
          name: undefined,
          y: 100,  // Replace with actual data
          color: '#9b4dff'  // Purple color
        }]
      }]
    };
  }
}
