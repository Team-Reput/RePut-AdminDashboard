import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Project } from '../../models/project.model';
import { Meeting } from '../../models/meeting.model';


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
  expandedMeetingId: string | null = null;

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
}
