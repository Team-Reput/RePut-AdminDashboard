import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as Highcharts from 'highcharts';
import { HighchartsChartModule } from 'highcharts-angular';
import { FinancialEntry } from '../sales-dashboard.component';
import HC_exporting from 'highcharts/modules/exporting';
import HC_offlineExporting from 'highcharts/modules/offline-exporting';

HC_exporting(Highcharts);
HC_offlineExporting(Highcharts);

@Component({
  selector: 'app-financial-charts',
  standalone: true,
  imports: [CommonModule, HighchartsChartModule],
  templateUrl: './financial-charts.component.html',
  styleUrl: './financial-charts.component.scss'
})
export class FinancialChartsComponent implements OnChanges {
  @Input() entries: FinancialEntry[] = [];

  Highcharts = Highcharts;
  revenueCostTrendsChartOptions: any;
  expenseBreakdownChartOptions: any;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['entries']) {
      this.generateCharts();
    }
  }

  private generateCharts(): void {
    if (!this.entries || this.entries.length === 0) {
      this.revenueCostTrendsChartOptions = null;
      this.expenseBreakdownChartOptions = null;
      return;
    }

    const monthsOrder: { [key: string]: number } = {
      'jan': 1, 'january': 1,
      'feb': 2, 'february': 2,
      'mar': 3, 'march': 3,
      'apr': 4, 'april': 4,
      'may': 5,
      'jun': 6, 'june': 6,
      'jul': 7, 'july': 7,
      'aug': 8, 'august': 8,
      'sep': 9, 'september': 9,
      'oct': 10, 'october': 10,
      'nov': 11, 'november': 11,
      'dec': 12, 'december': 12
    };

    // Sort chronologically by date/year/month (oldest on left, latest on right)
    const sortedEntries = [...this.entries].sort((a, b) => {
      if (a.startDate && b.startDate) {
        const tA = new Date(a.startDate).getTime();
        const tB = new Date(b.startDate).getTime();
        if (!isNaN(tA) && !isNaN(tB)) {
          return tA - tB;
        }
      }
      const yearA = parseInt(a.year, 10);
      const yearB = parseInt(b.year, 10);
      if (yearA !== yearB && !isNaN(yearA) && !isNaN(yearB)) {
        return yearA - yearB;
      }
      const keyA = (a.month || '').toLowerCase().trim();
      const keyB = (b.month || '').toLowerCase().trim();
      const monthA = monthsOrder[keyA] || monthsOrder[keyA.substring(0, 3)] || 0;
      const monthB = monthsOrder[keyB] || monthsOrder[keyB.substring(0, 3)] || 0;
      return monthA - monthB;
    });

    const categories = sortedEntries.map(e => `${e.month.substring(0, 3)} ${e.year}`);
    
    // Series data
    const totalRevenueData = sortedEntries.map(e => Number(e.totalRevenue || 0));
    const saasRevenueData = sortedEntries.map(e => Number(e.saasRevenue || 0));
    
    const expensesData = sortedEntries.map(e => {
      return Number(e.salesMarketingCost || 0) + Number(e.travelReimbursements || 0) + Number(e.adminExpenses || 0) + Number(e.otherExpenses || 0);
    });
    
    const netProfitData = sortedEntries.map((e, index) => {
      return Number(e.totalRevenue || 0) - expensesData[index];
    });

    // Chart 1: Revenue, SaaS Revenue, Expenses & Net Profit trends
    this.revenueCostTrendsChartOptions = {
      chart: {
        type: 'column',
        backgroundColor: '#ffffff',
        style: {
          fontFamily: "'Inter', sans-serif"
        }
      },
      title: {
        text: null
      },
      xAxis: {
        categories: categories,
        crosshair: true,
        labels: {
          style: {
            color: '#6b7280'
          }
        }
      },
      yAxis: {
        title: {
          text: 'Amount ($)',
          style: {
            color: '#6b7280'
          }
        },
        labels: {
          format: '${value:,.0f}',
          style: {
            color: '#6b7280'
          }
        },
        gridLineColor: '#f3f4f6'
      },
      tooltip: {
        shared: true,
        valuePrefix: '$',
        valueDecimals: 0
      },
      legend: {
        itemStyle: {
          color: '#4b5563',
          fontWeight: 'normal'
        }
      },
      plotOptions: {
        column: {
          pointPadding: 0.1,
          borderWidth: 0,
          borderRadius: 4
        }
      },
      series: [
        {
          name: 'Total Revenue',
          data: totalRevenueData,
          color: '#10b981', // green
          type: 'column'
        },
        {
          name: 'SaaS Revenue',
          data: saasRevenueData,
          color: '#06b6d4', // cyan
          type: 'column'
        },
        {
          name: 'Total Expenses',
          data: expensesData,
          color: '#ef4444', // red
          type: 'column'
        },
        {
          name: 'Net Profit',
          data: netProfitData,
          color: '#8b5cf6', // purple
          type: 'line',
          lineWidth: 3,
          marker: {
            radius: 5,
            lineWidth: 2,
            lineColor: '#ffffff',
            fillColor: '#8b5cf6'
          }
        }
      ],
      exporting: {
        enabled: true,
        buttons: {
          contextButton: {
            menuItems: ['viewFullscreen', 'downloadPNG', 'downloadPDF']
          }
        }
      }
    };

    // Chart 2: Aggregated Expense Breakdown
    let totalMarketing = 0;
    let totalTravel = 0;
    let totalAdmin = 0;
    let totalOther = 0;

    sortedEntries.forEach(e => {
      totalMarketing += Number(e.salesMarketingCost || 0);
      totalTravel += Number(e.travelReimbursements || 0);
      totalAdmin += Number(e.adminExpenses || 0);
      totalOther += Number(e.otherExpenses || 0);
    });

    const pieData = [
      { name: 'Sales & Marketing', y: totalMarketing, color: '#f59e0b' }, // amber
      { name: 'Travel Reimbursements', y: totalTravel, color: '#3b82f6' }, // blue
      { name: 'Admin Expenses', y: totalAdmin, color: '#ec4899' }, // pink
      { name: 'Other Expenses', y: totalOther, color: '#9ca3af' } // gray
    ].filter(d => d.y > 0); // only show positive expense groups

    this.expenseBreakdownChartOptions = {
      chart: {
        type: 'pie',
        backgroundColor: '#ffffff',
        style: {
          fontFamily: "'Inter', sans-serif"
        }
      },
      title: {
        text: null
      },
      tooltip: {
        pointFormat: '{series.name}: <b>${point.y:,.0f} ({point.percentage:.1f}%)</b>'
      },
      plotOptions: {
        pie: {
          allowPointSelect: true,
          cursor: 'pointer',
          dataLabels: {
            enabled: true,
            format: '<b>{point.name}</b>: {point.percentage:.1f}%',
            distance: 30,
            color: '#000000',
            connectorColor: '#374151',
            style: {
              textOutline: 'none',
              fontSize: '11px'
            }
          },
          showInLegend: true
        }
      },
      legend: {
        itemStyle: {
          color: '#4b5563',
          fontWeight: 'normal'
        }
      },
      series: [{
        name: 'Expenses',
        colorByPoint: true,
        data: pieData
      }],
      exporting: {
        enabled: true,
        buttons: {
          contextButton: {
            menuItems: ['viewFullscreen', 'downloadPNG', 'downloadPDF']
          }
        }
      }
    };
  }
}
