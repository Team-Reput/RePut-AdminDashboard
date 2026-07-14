import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Project } from '../../models/project.model';


@Component({
  selector: 'app-projects-health-monitoring',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './projects-health-monitoring.component.html',
  styleUrls: ['./projects-health-monitoring.component.scss']
})
export class ProjectsHealthMonitoringComponent {
  @Input() projects: Project[] = [];

  @Output() newProject = new EventEmitter<void>();
  @Output() updateProgress = new EventEmitter<Project>();
  @Output() logMeeting = new EventEmitter<Project>();
  @Output() filterChanged = new EventEmitter<string>();

  selectedFilter = 'All';

  // Track expanded state of descriptions per project
  expandedProjects: { [projectName: string]: boolean } = {};

  toggleDescription(projectName: string) {
    this.expandedProjects[projectName] = !this.expandedProjects[projectName];
  }

  isExpanded(projectName: string): boolean {
    return !!this.expandedProjects[projectName];
  }

  onFilterChange() {
    this.filterChanged.emit(this.selectedFilter);
  }

  // Get Initials for Avatars
  getInitials(name: string): string {
    if (!name) return '';
    return name.trim().split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase();
  }

  // Parse deadline string to a Date object
  parseDeadline(deadlineStr: string | undefined): Date | null {
    if (!deadlineStr) return null;
    
    // Try dd-mm-yyyy first
    const dmyRegex = /^(\d{1,2})-(\d{1,2})-(\d{4})$/;
    const dmyMatch = deadlineStr.match(dmyRegex);
    if (dmyMatch) {
      const day = parseInt(dmyMatch[1], 10);
      const month = parseInt(dmyMatch[2], 10) - 1; // months are 0-indexed in JS
      const year = parseInt(dmyMatch[3], 10);
      return new Date(year, month, day);
    }

    // Fallback to standard JS parsing (e.g. "18 Jul 2026" or "2026-07-18")
    const parsed = Date.parse(deadlineStr);
    if (!isNaN(parsed)) {
      return new Date(parsed);
    }

    return null;
  }

  // Calculate deadline text and styling dynamically
  getDeadlineInfo(project: Project): { text: string; class: string } {
    if (project.status === 'completed') {
      return { text: '✓ Delivered', class: 'ok' };
    }
    if (project.status === 'cancelled') {
      return { text: 'Cancelled', class: 'overdue' };
    }
    
    const deadlineDate = this.parseDeadline(project.deadline);
    if (!deadlineDate) {
      return { text: 'No deadline', class: 'ok' };
    }

    const currentDate = new Date();
    // Normalize dates to midnight to compute clean day-based difference
    currentDate.setHours(0, 0, 0, 0);
    deadlineDate.setHours(0, 0, 0, 0);

    const diffTime = deadlineDate.getTime() - currentDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { text: `⏱ Overdue by ${Math.abs(diffDays)} days`, class: 'overdue' };
    }
    if (diffDays === 0) {
      return { text: '⏱ Deadline today', class: 'soon' };
    }
    if (diffDays <= 14) {
      return { text: `⏱ ${diffDays} days left`, class: 'soon' };
    }
    return { text: `⏱ ${diffDays} days left`, class: 'ok' };
  }

  // Get Priority CSS styling variable (for borders/indicators)
  getPriorityColor(priority: string): string {
    switch (priority) {
      case 'critical': return '#2B1B45';
      case 'high': return '#B3261E'; // var(--red)
      case 'medium': return '#B5651D'; // var(--amber)
      case 'low':
      default:
        return '#146C4E'; // var(--verify)
    }
  }

  // Get Priority CSS gradient background for the progress fill
  getProgressGradient(project: Project): string {
    switch (project.priority) {
      case 'critical': return 'linear-gradient(90deg, #2B1B45, #5C4A78)';
      case 'high': return 'linear-gradient(90deg, #B3261E, #E57373)';
      case 'medium': return 'linear-gradient(90deg, #B5651D, #E0A458)';
      case 'low':
      default:
        return 'linear-gradient(90deg, #146C4E, #37C88C)';
    }
  }

  // Filter projects by status
  get filteredProjects(): Project[] {
    if (this.selectedFilter === 'All') {
      return this.projects;
    }
    if (this.selectedFilter === 'In progress') {
      return this.projects.filter(p => p.status === 'progress');
    }
    if (this.selectedFilter === 'Accepted by client') {
      return this.projects.filter(p => p.status === 'accepted');
    }
    if (this.selectedFilter === 'On hold') {
      return this.projects.filter(p => p.status === 'hold');
    }
    if (this.selectedFilter === 'Completed') {
      return this.projects.filter(p => p.status === 'completed');
    }
    if (this.selectedFilter === 'Cancelled') {
      return this.projects.filter(p => p.status === 'cancelled');
    }
    return this.projects;
  }

  // Get weight of priority for sorting (critical first, then high, medium, low)
  getPriorityWeight(priority: string): number {
    switch (priority) {
      case 'critical': return 4;
      case 'high': return 3;
      case 'medium': return 2;
      case 'low': return 1;
      default: return 0;
    }
  }

  // Sort filtered projects to ensure child projects are nested directly under their parent
  // and sorted by priority (critical first, then high, medium, low)
  get sortedAndFilteredProjects(): Project[] {
    const list = this.filteredProjects;
    const sorted: Project[] = [];
    const visited = new Set<string>();

    // Step 1: Find all standalone and parent projects, sorted by priority weight desc
    const parents = list
      .filter(p => !p.parentProject)
      .sort((a, b) => this.getPriorityWeight(b.priority) - this.getPriorityWeight(a.priority));

    parents.forEach(parent => {
      sorted.push(parent);
      visited.add(parent.name);

      // Find children of this parent in the filtered list, sorted by priority weight desc
      const children = list
        .filter(c => c.parentProject === parent.name)
        .sort((a, b) => this.getPriorityWeight(b.priority) - this.getPriorityWeight(a.priority));
      children.forEach(child => {
        sorted.push(child);
        visited.add(child.name);
      });
    });

    // Step 2: Add any remaining projects (orphans/edge cases), sorted by priority weight desc
    const remaining = list
      .filter(project => !visited.has(project.name))
      .sort((a, b) => this.getPriorityWeight(b.priority) - this.getPriorityWeight(a.priority));
    
    remaining.forEach(project => {
      sorted.push(project);
      visited.add(project.name);
    });

    return sorted;
  }

  // Quick action handlers
  onNewProject() {
    this.newProject.emit();
  }

  onUpdateProgress(project: Project) {
    this.updateProgress.emit(project);
  }

  onLogMeeting(project: Project) {
    this.logMeeting.emit(project);
  }

  // Helper properties for statistics
  get totalCount(): number {
    return this.projects.length;
  }

  get parentCount(): number {
    return this.projects.filter(p => !p.parentProject).length;
  }

  get subProjectCount(): number {
    return this.projects.filter(p => !!p.parentProject).length;
  }
}
