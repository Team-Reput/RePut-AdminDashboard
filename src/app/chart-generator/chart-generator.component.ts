import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as Highcharts from 'highcharts';
import { HighchartsChartModule } from 'highcharts-angular';
import HC_exporting from 'highcharts/modules/exporting';
import HC_offlineExporting from 'highcharts/modules/offline-exporting';
import { ChartService, SavedChart } from '../services/chart.service';
import { AuthService } from '../services/auth.service';

// Initialize exporting module for downloadable charts
HC_exporting(Highcharts);
HC_offlineExporting(Highcharts);

interface DataEntry {
  month: string;
  value: number;
}

@Component({
  selector: 'app-chart-generator',
  standalone: true,
  imports: [CommonModule, FormsModule, HighchartsChartModule],
  templateUrl: './chart-generator.component.html',
  styleUrls: ['./chart-generator.component.scss']
})
export class ChartGeneratorComponent implements OnInit {
  Highcharts: typeof Highcharts = Highcharts;
  chartOptions: Highcharts.Options = {};

  chartTitle = 'Employee Benefits Expense';
  yAxisLabel = 'Amount';

  // Two input bindings for adding a new log
  newMonth = '';
  newValue: number | null = null;

  // Logs list
  dataEntries: DataEntry[] = [
    { month: "15 Dec 25", value: 1858384 },
    { month: "15 Jan 26", value: 1729402 },
    { month: "15 Feb 26", value: 1625273 },
    { month: "15 Mar 26", value: 1585054 },
    { month: "15 Apr 26", value: 1636963 },
    { month: "15 May 26", value: 1490206 }
  ];

  userId: number | null = null;
  savedCharts: Array<SavedChart & { selected?: boolean }> = [];
  savedChartOptions = new Map<number, Highcharts.Options>();
  chartInstances = new Map<number, Highcharts.Chart>();
  allSelected = false;
  downloadFormat: 'png' | 'pdf' = 'png';
  isGraphGenerated = false;

  constructor(
    private chartService: ChartService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const user = this.authService.getUser();
    if (user) {
      this.userId = user.user_id;
      this.loadSavedCharts();
    }
    this.isGraphGenerated = true;
    this.updateChart();
  }

  loadSavedCharts(): void {
    if (!this.userId) return;
    this.chartService.getSavedCharts(this.userId).subscribe({
      next: (charts) => {
        this.savedCharts = charts.map(c => ({ ...c, selected: false }));
        // Pre-compute chart options once to avoid re-creating on every change detection
        this.savedChartOptions.clear();
        this.savedCharts.forEach(chart => {
          this.savedChartOptions.set(chart.id, this.buildMiniChartOptions(chart));
        });
        this.checkIfAllSelected();
      },
      error: (err) => console.error('Failed to load saved charts:', err)
    });
  }

  addEntry(): void {
    if (this.newMonth.trim() && this.newValue !== null && !isNaN(this.newValue)) {
      let formattedMonth = this.newMonth.trim();
      
      // Match calendar datepicker YYYY-MM-DD format
      const datePattern = /^(\d{4})-(\d{2})-(\d{2})$/;
      const match = formattedMonth.match(datePattern);
      if (match) {
        const year = match[1].substring(2); // "26"
        const monthNum = parseInt(match[2], 10);
        const day = parseInt(match[3], 10);
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const monthName = months[monthNum - 1] || match[2];
        formattedMonth = `${day} ${monthName} ${year}`; // e.g. "15 Jul 26"
      }

      this.dataEntries.push({
        month: formattedMonth,
        value: this.newValue
      });
      // Clear inputs
      this.newMonth = '';
      this.newValue = null;
    }
  }

  removeEntry(index: number): void {
    if (index >= 0 && index < this.dataEntries.length) {
      this.dataEntries.splice(index, 1);
    }
  }

  clearAll(): void {
    this.dataEntries = [];
    this.isGraphGenerated = false;
  }

  onChartInstance(chart: Highcharts.Chart, chartId: number): void {
    this.chartInstances.set(chartId, chart);
  }

  toggleSelectAll(): void {
    this.savedCharts.forEach(c => c.selected = this.allSelected);
  }

  checkIfAllSelected(): void {
    this.allSelected = this.savedCharts.length > 0 && this.savedCharts.every(c => c.selected);
  }

  deleteChart(id: number, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.chartService.deleteChart(id).subscribe({
      next: () => {
        this.chartInstances.delete(id);
        this.loadSavedCharts();
      },
      error: (err) => console.error('Failed to delete chart:', err)
    });
  }

  downloadSelectedCharts(): void {
    const selected = this.savedCharts.filter(c => c.selected);
    if (selected.length === 0) {
      alert('Please select at least one chart to download.');
      return;
    }

    const mimeType = this.downloadFormat === 'pdf' ? 'application/pdf' : 'image/png';

    selected.forEach(chart => {
      const instance = this.chartInstances.get(chart.id);
      if (instance) {
        instance.exportChartLocal({
          type: mimeType as any,
          filename: chart.chartTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()
        });
      }
    });
  }

  viewChartFullscreen(chartId: number): void {
    const instance = this.chartInstances.get(chartId);
    if (instance) {
      instance.fullscreen?.toggle();
    }
  }

  private buildMiniChartOptions(chart: SavedChart): Highcharts.Options {
    const categories = chart.dataPoints.map(e => e.month);
    const data = chart.dataPoints.map(e => Number(e.value));

    return {
      chart: {
        type: 'column',
        backgroundColor: '#ffffff',
        height: 220,
        style: {
          fontFamily: "'Outfit', sans-serif"
        },
        animation: false
      },
      title: {
        text: chart.chartTitle,
        style: {
          fontSize: '13px',
          fontWeight: '600',
          color: '#1f2937'
        }
      },
      xAxis: {
        categories: categories,
        labels: {
          style: {
            fontSize: '9px',
            color: '#6b7280'
          }
        }
      },
      yAxis: {
        title: {
          text: chart.yAxisLabel,
          style: {
            fontSize: '9px',
            color: '#6b7280'
          }
        },
        labels: {
          formatter: function () {
            return (this.value as number).toLocaleString();
          },
          style: {
            fontSize: '8px',
            color: '#6b7280'
          }
        },
        gridLineColor: '#f3f4f6'
      },
      legend: {
        enabled: false
      },
      plotOptions: {
        column: {
          borderRadius: 4,
          borderWidth: 0,
          color: '#10B981',
          pointPadding: 0.15
        }
      },
      tooltip: {
        valueDecimals: 0,
        style: { fontSize: '11px' }
      },
      credits: {
        enabled: false
      },
      exporting: {
        enabled: false
      },
      series: [
        {
          name: chart.yAxisLabel || 'Value',
          data: data,
          type: 'column'
        }
      ]
    };
  }

  updateChart(): void {
    this.isGraphGenerated = true;
    const categories = this.dataEntries.map(e => e.month);
    const data = this.dataEntries.map(e => e.value);

    this.chartOptions = {
      chart: {
        type: 'column',
        backgroundColor: '#ffffff',
        style: {
          fontFamily: "'Outfit', sans-serif"
        }
      },
      title: {
        text: this.chartTitle || 'Bar Graph',
        style: {
          color: '#101828',
          fontWeight: '600',
          fontSize: '20px'
        }
      },
      xAxis: {
        categories: categories,
        crosshair: true,
        title: {
          text: 'Month / Label',
          style: {
            color: '#4B5563',
            fontFamily: "'Outfit', sans-serif"
          }
        },
        labels: {
          style: {
            color: '#4B5563',
            fontFamily: "'Outfit', sans-serif"
          }
        }
      },
      yAxis: {
        title: {
          text: this.yAxisLabel || 'Values',
          style: {
            color: '#4B5563',
            fontFamily: "'Outfit', sans-serif"
          }
        },
        labels: {
          formatter: function() {
            return this.value.toLocaleString();
          },
          style: {
            color: '#4B5563',
            fontFamily: "'Outfit', sans-serif"
          }
        },
        gridLineColor: '#E4E6E1'
      },
      tooltip: {
        headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
        pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
          '<td style="padding:0"><b>{point.y:,.0f}</b></td></tr>',
        footerFormat: '</table>',
        shared: true,
        useHTML: true
      },
      legend: {
        enabled: true,
        itemStyle: {
          color: '#4B5563',
          fontWeight: 'normal',
          fontFamily: "'Outfit', sans-serif"
        }
      },
      plotOptions: {
        column: {
          pointPadding: 0.2,
          borderWidth: 0,
          borderRadius: 6,
          color: '#10B981'
        }
      },
      exporting: {
        enabled: true,
        buttons: {
          contextButton: {
            menuItems: ['viewFullscreen', 'downloadPNG', 'downloadPDF']
          }
        }
      },
      series: [
        {
          name: this.yAxisLabel || 'Value',
          data: data,
          type: 'column'
        }
      ],
      credits: {
        enabled: false
      }
    };
  }

  saveCurrentChart(): void {
    if (this.dataEntries.length === 0) {
      alert('No data to save. Please add entries and generate the graph first.');
      return;
    }
    if (!this.userId) {
      alert('User not authenticated.');
      return;
    }

    this.chartService.saveChart({
      user_id: this.userId,
      chartTitle: this.chartTitle,
      yAxisLabel: this.yAxisLabel,
      dataPoints: this.dataEntries
    }).subscribe({
      next: () => {
        this.loadSavedCharts();
        // Clear active chart state and reset for new entry
        this.dataEntries = [];
        this.chartTitle = 'Employee Benefits Expense';
        this.yAxisLabel = 'Amount';
        this.newMonth = '';
        this.newValue = null;
        this.chartOptions = {};
        this.isGraphGenerated = false;
      },
      error: (err) => console.error('Failed to save generated chart:', err)
    });
  }
}

