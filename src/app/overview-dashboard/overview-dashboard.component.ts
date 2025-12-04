import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-overview-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './overview-dashboard.component.html',
  styleUrl: './overview-dashboard.component.scss'
})
export class OverviewDashboardComponent {
  username = 'admin_user';

  technicalStats = {
    activeUsers: 127,
    apiHits: 3298,
    apiLatency: 89.39,
    networkTraffic: 168.82
  };

  salesStats = {
    totalCustomers: 5,
    totalOffers: 8,
    expectedRevenue: 50000,
    churn: 1
  };

    constructor() { }

  ngOnInit(): void {
  }

  logout(): void {
    // Implement logout logic
    console.log('Logout clicked');
  }
}
