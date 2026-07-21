import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FinancialEntry } from '../sales-dashboard.component';
import { saveAs } from 'file-saver';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-financiallog-table',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './financiallog-table.component.html',
  styleUrl: './financiallog-table.component.scss'
})
export class FinanciallogTableComponent {
  @Input() entries: FinancialEntry[] = [];
  @Output() onAddEntry = new EventEmitter<void>();
  selectedPeriod = 'All';

  constructor(private authService: AuthService) {}

  hasRole(...roles: string[]): boolean {
    return roles.includes(this.authService.getUserRole());
  }

  get filteredEntries(): FinancialEntry[] {
    const list = this.entries || [];
    if (this.selectedPeriod === 'All') {
      return list;
    }
    return list.filter(e => e.month === this.selectedPeriod || e.year === this.selectedPeriod);
  }

  downloadCSV() {
    const headers = [
      'Period',
      'Start Date',
      'End Date',
      'Total Revenue',
      'SaaS Revenue',
      'Marketing Cost',
      'Travel Reimbursements',
      'Admin Expenses',
      'Other Expenses'
    ];

    const escapeCsvValue = (val: any) => {
      if (val === null || val === undefined) return '';
      const strVal = String(val);
      if (strVal.includes(',') || strVal.includes('"') || strVal.includes('\n')) {
        return `"${strVal.replace(/"/g, '""')}"`;
      }
      return strVal;
    };

    const csvRows = [headers.join(',')];

    for (const entry of this.filteredEntries) {
      const period = `${entry.month} ${entry.year}`;
      const row = [
        escapeCsvValue(period),
        escapeCsvValue(entry.startDate),
        escapeCsvValue(entry.endDate),
        escapeCsvValue(entry.totalRevenue),
        escapeCsvValue(entry.saasRevenue),
        escapeCsvValue(entry.salesMarketingCost),
        escapeCsvValue(entry.travelReimbursements),
        escapeCsvValue(entry.adminExpenses),
        escapeCsvValue(entry.otherExpenses)
      ];
      csvRows.push(row.join(','));
    }

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    
    const timestamp = new Date().toISOString().slice(0, 10);
    const filename = `financial_report_${this.selectedPeriod.toLowerCase()}_${timestamp}.csv`;
    
    saveAs(blob, filename);
  }
}
