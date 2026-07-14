import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SalesEntry } from '../sales-dashboard.component';

@Component({
  selector: 'app-saleslog-table',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './saleslog-table.component.html',
  styleUrl: './saleslog-table.component.scss'
})
export class SaleslogTableComponent {
  @Input() entries: SalesEntry[] = [];
  @Output() onAddEntry = new EventEmitter<void>();
  selectedStatus = 'All';

  get filteredEntries(): SalesEntry[] {
    if (this.selectedStatus === 'All') {
      return this.entries;
    }
    return this.entries.filter(e => e.leadStatus === this.selectedStatus);
  }

  downloadCSV() {
    const headers = [
      'Date',
      'Status',
      'New Customers',
      'Offers Made',
      'Expected Revenue',
      'Lost Deals',
      'Pipeline Progress',
      'Obstacles & Blockers'
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
      const row = [
        escapeCsvValue(entry.date),
        escapeCsvValue(entry.leadStatus),
        escapeCsvValue(entry.newCustomers),
        escapeCsvValue(entry.offersMade),
        escapeCsvValue(entry.expectedRevenue),
        escapeCsvValue(entry.churnLostDeals),
        escapeCsvValue(entry.pipelineProgress),
        escapeCsvValue(entry.obstaclesBlockers)
      ];
      csvRows.push(row.join(','));
    }

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    
    const timestamp = new Date().toISOString().slice(0, 10);
    const filename = `sales_report_${this.selectedStatus.toLowerCase()}_${timestamp}.csv`;
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
