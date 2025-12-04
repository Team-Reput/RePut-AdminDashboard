import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import * as Highcharts from 'highcharts';
import { HighchartsChartModule } from 'highcharts-angular';
@Component({
  selector: 'app-technical-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule,HighchartsChartModule],
  templateUrl: './technical-dashboard.component.html',
  styleUrl: './technical-dashboard.component.scss'
})
export class TechnicalDashboardComponent {
  username = 'John Doe';
    projectForm!: FormGroup;
    Highcharts = Highcharts;
      loanDisbursementChartOptions: any;
  pieChartOptions: any;
  isProjectFormVisible: boolean = false;
  technicalStats = {
    activeUsers: 181,
    apiHits: 4879,
    apiLatency: 43.06,
    networkTrafficUp: 218.98,
    networkTrafficDown: 463.73
  };

    statusOptions = [
    { value: 'healthy', label: 'Healthy' },
    { value: 'warning', label: 'Warning' },
    { value: 'critical', label: 'Critical' }
  ];
  constructor(private fb: FormBuilder){}

    ngOnInit(): void {
          this.projectForm = this.fb.group({
      projectName: ['', Validators.required],
      status: ['healthy', Validators.required],
      uptime: [0, [Validators.required, Validators.min(0), Validators.max(100)]]
    });

        this.setLoanDisbursementChart();
    this.setPieChart();
  }

    openProjectForm() {
    this.isProjectFormVisible = true;
  }

  // Close Project Form Modal
  closeModal() {
    this.isProjectFormVisible = false;
  }

  // Handle Status Selection
  selectStatus(value: string) {
    this.projectForm.patchValue({ status: value });
  }

  // Submit Project Form
  onSubmit() {
    if (this.projectForm.valid) {
      const formData = this.projectForm.value;
      console.log('Project Form Submitted', formData);
      this.closeModal(); // Close the form after submission
    }
  }

  logout(): void {
    console.log('Logout clicked');
  }

  setLoanDisbursementChart() {
    this.loanDisbursementChartOptions = {
      chart: {
        type: 'line'
      },
      title: {
        text: 'Latency and Success Rate Over Time'
      },
      subtitle: {
        text: 'Latency vs Success Rate'
      },
      xAxis: {
        categories: ['Time1', 'Time2', 'Time3', 'Time4', 'Time5', 'Time6', 'Time7']  // Time intervals
      },
      yAxis: [{
        title: {
          text: 'Latency (ms)'
        },
        min: 0
      }, {
        title: {
          text: 'Success Rate (%)'
        },
        opposite: true,
        min: 0
      }],
      series: [{
        name: 'Latency (ms)',
        data: [100, 120, 110, 130, 115, 125, 140],  // Latency data
        color: '#00bcd4',
        yAxis: 0
      }, {
        name: 'Success Rate (%)',
        data: [85, 90, 80, 88, 85, 92, 90],  // Success Rate data
        color: '#9b4dff',
        yAxis: 1
      }],
      legend: {
        layout: 'vertical',
        align: 'right',
        verticalAlign: 'top'
      }
    };
  }

  // Function for setting up the Pie Chart (Maximum Data Processed Categorization)
  setPieChart() {
    this.pieChartOptions = {
      chart: {
        type: 'pie'
      },
      title: {
        text: 'Maximum Data Processed Categorization'
      },
      series: [{
        name: 'Categories',
        data: [{
          name: 'Category 1',
          y: 30,  // Replace with actual data value
          color: '#00bcd4'
        }, {
          name: 'Category 2',
          y: 20,  // Replace with actual data value
          color: '#9b4dff'
        }, {
          name: 'Category 3',
          y: 15,  // Replace with actual data value
          color: '#ff9800'
        }, {
          name: 'Category 4',
          y: 25,  // Replace with actual data value
          color: '#f44336'
        }, {
          name: 'Category 5',
          y: 10,  // Replace with actual data value
          color: '#4caf50'
        }]
      }]
    };
  }
}
