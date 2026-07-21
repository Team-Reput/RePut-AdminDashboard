import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Project } from '../../models/project.model';
import { Meeting } from '../../models/meeting.model';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-review-meetings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './review-meetings.component.html',
  styleUrls: ['./review-meetings.component.scss']
})
export class ReviewMeetingsComponent {
  @Input() meetings: Meeting[] = [];
  @Input() projects: Project[] = [];

  @Output() logMeeting = new EventEmitter<void>();

  selectedFilter = 'All';
  currentPage = 1;
  pageSize = 5;
  Math = Math;
  expandedMeetingId: string | null = null;
  selectedMeetingForDetails: Meeting | null = null;

  constructor(private authService: AuthService) {}

  hasRole(...roles: string[]): boolean {
    return roles.includes(this.authService.getUserRole());
  }

  onFilterChange() {
    this.currentPage = 1;
  }

  onLogMeeting() {
    this.logMeeting.emit();
  }

  getInitials(name: string): string {
    if (!name) return '';
    return name.trim().split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase();
  }

  toggleExpand(meetingId: string | undefined) {
    if (!meetingId) return;
    if (this.expandedMeetingId === meetingId) {
      this.expandedMeetingId = null;
    } else {
      this.expandedMeetingId = meetingId;
    }
  }

  openMeetingDetails(meeting: Meeting) {
    this.selectedMeetingForDetails = meeting;
  }

  closeMeetingDetails() {
    this.selectedMeetingForDetails = null;
  }

  get filteredMeetings(): Meeting[] {
    const sorted = [...this.meetings].sort((a, b) => {
      const idA = (a.id ?? '').toString();
      const idB = (b.id ?? '').toString();
      return idB.localeCompare(idA);
    });
    if (this.selectedFilter === 'All') {
      return sorted;
    }
    return sorted.filter(m => m.project === this.selectedFilter);
  }

  get meetingsWithRecordings(): number {
    return this.meetings.filter(m => !!m.recordingLength).length;
  }

  // Pagination Getters & Helpers
  get totalPages(): number {
    return Math.ceil(this.filteredMeetings.length / this.pageSize) || 1;
  }

  get paginatedMeetings(): Meeting[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    return this.filteredMeetings.slice(startIndex, startIndex + this.pageSize);
  }

  get pageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }
}
