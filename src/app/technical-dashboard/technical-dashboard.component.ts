import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import * as Highcharts from 'highcharts';
import { HighchartsChartModule } from 'highcharts-angular';
import { RouterModule } from '@angular/router';
import HC_exporting from 'highcharts/modules/exporting';
import HC_offlineExporting from 'highcharts/modules/offline-exporting';

HC_exporting(Highcharts);
HC_offlineExporting(Highcharts);
import { ProjectsHealthMonitoringComponent } from './projects-health-monitoring/projects-health-monitoring.component';
import { Project } from '../models/project.model';
import { ProjectService } from '../services/project.service';
import { ReviewMeetingsComponent } from './review-meetings/review-meetings.component';
import { Meeting } from '../models/meeting.model';
import { MeetingService } from '../services/meeting.service';
import { AuthService } from '../services/auth.service';
import { LoadingComponent } from '../loading/loading.component';

@Component({
  selector: 'app-technical-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, HighchartsChartModule, RouterModule, ProjectsHealthMonitoringComponent, ReviewMeetingsComponent, LoadingComponent],
  templateUrl: './technical-dashboard.component.html',
  styleUrl: './technical-dashboard.component.scss'
})
export class TechnicalDashboardComponent {
  username = 'John Doe';
  isLoading = false;
  private activeLoads = 0;
  Highcharts = Highcharts;
  loanDisbursementChartOptions: any;
  pieChartOptions: any;

  projects: Project[] = [];
  meetings: Meeting[] = [];
  currentFilter = 'All';
  selectedRecording: File | null = null;
  selectedFiles: File[] = [];

  // Modals Visibility
  isNewProjectFormVisible = false;
  isUpdateProgressFormVisible = false;
  isLogMeetingFormVisible = false;

  // Modals Forms
  newProjectForm!: FormGroup;
  updateProgressForm!: FormGroup;
  logMeetingForm!: FormGroup;

  // Chip Pickers
  newProjectTeamMembers: string[] = ['Jyoti Sharma', 'Rahul Verma'];
  logMeetingAttendees: string[] = ['Jyoti Sharma', 'Client stakeholder'];

  technicalStats = {
    activeUsers: 181,
    apiHits: 4879,
    apiLatency: 43.06,
    networkTrafficUp: 218.98,
    networkTrafficDown: 463.73
  };

  constructor(
    private fb: FormBuilder,
    private projectService: ProjectService,
    private meetingService: MeetingService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    const currentUser = this.authService.getUser();
    if (currentUser) {
      this.username = currentUser.full_name;
    }

    // New Project Form Initialization
    this.newProjectForm = this.fb.group({
      projectName: ['', Validators.required],
      clientName: [''],
      clientContact: [''],
      parentProject: [''],
      startDate: [this.getTodayDate()],
      deadline: [''],
      priority: ['medium'],
      teamMembers: [this.newProjectTeamMembers],
      status: ['progress'],
      description: ['']
    });

    // Update Progress Form Initialization
    this.updateProgressForm = this.fb.group({
      project: ['E-commerce platform revamp'],
      progress: [65],
      priority: ['medium'],
      status: ['progress'],
      description: ['']
    });

    this.updateProgressForm.get('project')?.valueChanges.subscribe(projectName => {
      const project = this.projects.find(p => p.name === projectName);
      if (project) {
        this.updateProgressForm.patchValue({
          progress: project.progress,
          priority: project.priority,
          status: project.status,
          description: project.description || ''
        }, { emitEvent: false });
      }
    });

    // Log Meeting Form Initialization
    this.logMeetingForm = this.fb.group({
      meetingTitle: [''],
      relatedProject: ['E-commerce platform revamp'],
      date: [this.getTodayDate()],
      time: [''],
      attendees: [this.logMeetingAttendees],
      minutesOfMeeting: ['']
    });

    this.setLoanDisbursementChart();
    this.setPieChart();
    this.initializeProjects();
    this.initializeMeetings();
  }

  private startLoad() {
    this.activeLoads++;
    this.isLoading = true;
  }

  private endLoad() {
    this.activeLoads--;
    if (this.activeLoads <= 0) {
      this.activeLoads = 0;
      this.isLoading = false;
    }
  }

  initializeProjects() {
    const currentUser = this.authService.getUser();
    const currentUserId = currentUser ? currentUser.user_id : 1;

    this.startLoad();
    this.projectService.getProjectsByUser(currentUserId, this.currentFilter).subscribe({
      next: (dbProjects: Project[]) => {
        this.projects = dbProjects;
        this.endLoad();
      },
      error: (err) => {
        console.error('Error fetching projects from database:', err);
        this.projects = [];
        this.endLoad();
      }
    });
  }

  onFilterChanged(filter: string) {
    this.currentFilter = filter;
    this.initializeProjects();
  }

  initializeMeetings() {
    const currentUser = this.authService.getUser();
    const currentUserId = currentUser ? currentUser.user_id : 1;

    this.startLoad();
    this.meetingService.getMeetingsByUser(currentUserId).subscribe({
      next: (dbMeetings) => {
        if (dbMeetings && dbMeetings.length > 0) {
          // Map data from server backend format back to frontend properties
          this.meetings = dbMeetings.map(m => ({
            id: m.id,
            title: m.title,
            project: m.project,
            date: m.date,
            time: m.time,
            minutesOfMeeting: m.minutesOfMeeting,
            attendees: Array.isArray(m.attendees) ? m.attendees : JSON.parse(m.attendees || '[]'),
            recordingLength: m.recordingLength,
            filesCount: Number(m.filesCount || 0)
          }));
          this.sortMeetings();
          this.saveMeetingsToStorage();
        } else {
          this.useDefaultMeetings();
        }
        this.endLoad();
      },
      error: (err) => {
        console.error('Error fetching meetings from database, falling back to storage:', err);
        const stored = localStorage.getItem('reput_meetings');
        if (stored) {
          this.meetings = JSON.parse(stored);
        } else {
          this.useDefaultMeetings();
        }
        this.endLoad();
      }
    });
  }

  useDefaultMeetings() {
    const defaultMeetings: Meeting[] = [];
    this.meetings = defaultMeetings;
    this.saveMeetingsToStorage();
  }

  saveMeetingsToStorage() {
    localStorage.setItem('reput_meetings', JSON.stringify(this.meetings));
  }

  getTodayDate(): string {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }

  // Get Initials for Avatars
  getInitials(name: string): string {
    return name.trim().split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase();
  }

  // Team Member Management
  addTeamMember(name: string): void {
    const trimmed = name.trim();
    if (trimmed && !this.newProjectTeamMembers.includes(trimmed)) {
      this.newProjectTeamMembers.push(trimmed);
      this.newProjectForm.patchValue({ teamMembers: this.newProjectTeamMembers });
    }
  }

  removeTeamMember(index: number): void {
    this.newProjectTeamMembers.splice(index, 1);
    this.newProjectForm.patchValue({ teamMembers: this.newProjectTeamMembers });
  }

  // Attendee Management
  addAttendee(name: string): void {
    const trimmed = name.trim();
    if (trimmed && !this.logMeetingAttendees.includes(trimmed)) {
      this.logMeetingAttendees.push(trimmed);
      this.logMeetingForm.patchValue({ attendees: this.logMeetingAttendees });
    }
  }

  removeAttendee(index: number): void {
    this.logMeetingAttendees.splice(index, 1);
    this.logMeetingForm.patchValue({ attendees: this.logMeetingAttendees });
  }

  // Modal Open/Close Controls
  openNewProjectForm() {
    this.isNewProjectFormVisible = true;
  }
  closeNewProjectForm() {
    this.isNewProjectFormVisible = false;
  }

  openUpdateProgressForm() {
    if (this.projects.length > 0 && !this.updateProgressForm.get('project')?.value) {
      this.updateProgressForm.patchValue({
        project: this.projects[0].name,
        progress: this.projects[0].progress,
        priority: this.projects[0].priority,
        status: this.projects[0].status
      });
    }
    this.isUpdateProgressFormVisible = true;
  }

  openUpdateProgressForProject(project: Project) {
    this.updateProgressForm.patchValue({
      project: project.name,
      progress: project.progress,
      priority: project.priority,
      status: project.status,
      description: project.description || ''
    });
    this.isUpdateProgressFormVisible = true;
  }

  closeUpdateProgressForm() {
    this.isUpdateProgressFormVisible = false;
  }

  openLogMeetingForm() {
    if (this.projects.length > 0 && !this.logMeetingForm.get('relatedProject')?.value) {
      this.logMeetingForm.patchValue({
        relatedProject: this.projects[0].name
      });
    }
    this.isLogMeetingFormVisible = true;
  }

  openLogMeetingForProject(project: Project) {
    this.logMeetingForm.patchValue({
      relatedProject: project.name
    });
    this.isLogMeetingFormVisible = true;
  }

  closeLogMeetingForm() {
    this.isLogMeetingFormVisible = false;
  }

  // Form Submissions
  onSubmitNewProject() {
    if (this.newProjectForm.valid) {
      const formVal = this.newProjectForm.value;
      const newProj: Project = {
        name: formVal.projectName,
        client: formVal.clientName || 'Internal',
        clientContact: formVal.clientContact || '',
        parentProject: formVal.parentProject || undefined,
        startDate: formVal.startDate,
        deadline: formVal.deadline,
        priority: formVal.priority,
        status: formVal.status,
        progress: formVal.status === 'completed' ? 100 : 0,
        teamMembers: [...this.newProjectTeamMembers],
        description: formVal.description || ''
      };

      const currentUser = this.authService.getUser();
      const currentUserId = currentUser ? currentUser.user_id : 1;
      this.projectService.insertProject(newProj, currentUserId).subscribe({
        next: (savedProject: Project) => {
          this.projects.push(savedProject);
          this.closeNewProjectForm();

          // Reset team member pickers
          this.newProjectTeamMembers = ['Jyoti Sharma', 'Rahul Verma'];
          this.newProjectForm.reset({
            projectName: '',
            clientName: '',
            clientContact: '',
            parentProject: '',
            startDate: this.getTodayDate(),
            deadline: '',
            priority: 'medium',
            teamMembers: [this.newProjectTeamMembers],
            status: 'progress',
            description: ''
          });
        },
        error: (err) => {
          console.error('API Error details:', err);
          alert('Could not connect to backend server. Make sure the database and API are running.');
        }
      });
    }
  }

  get selectedProjectCurrentProgress(): number {
    const selectedProjectName = this.updateProgressForm?.get('project')?.value;
    const project = this.projects.find(p => p.name === selectedProjectName);
    return project ? project.progress : 0;
  }

  getMeetingDateTime(m: Meeting): Date {
    let timeStr = m.time || '12:00 PM';
    let hours = 12;
    let minutes = 0;
    
    const ampmMatch = timeStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (ampmMatch) {
      hours = parseInt(ampmMatch[1], 10);
      minutes = parseInt(ampmMatch[2], 10);
      const ampm = ampmMatch[3].toUpperCase();
      if (ampm === 'PM' && hours < 12) hours += 12;
      if (ampm === 'AM' && hours === 12) hours = 0;
    } else {
      const hmMatch = timeStr.match(/^(\d{1,2}):(\d{2})$/);
      if (hmMatch) {
        hours = parseInt(hmMatch[1], 10);
        minutes = parseInt(hmMatch[2], 10);
      }
    }
    
    const d = new Date(m.date);
    if (!isNaN(d.getTime())) {
      d.setHours(hours, minutes, 0, 0);
      return d;
    }
    return new Date(0);
  }

  sortMeetings() {
    this.meetings.sort((a, b) => this.getMeetingDateTime(b).getTime() - this.getMeetingDateTime(a).getTime());
  }

  onRecordingSelected(event: any) {
    const file = event.target.files?.[0];
    if (file) {
      const maxSize = 200 * 1024 * 1024; // 200MB
      if (file.size > maxSize) {
        alert('Recording file size exceeds 200MB limit.');
        return;
      }
      this.selectedRecording = file;
    }
  }

  onFilesSelected(event: any) {
    const files = event.target.files;
    if (files) {
      for (let i = 0; i < files.length; i++) {
        this.selectedFiles.push(files[i]);
      }
    }
  }

  removeSelectedRecording() {
    this.selectedRecording = null;
  }

  removeSelectedFile(idx: number) {
    this.selectedFiles.splice(idx, 1);
  }

  getFriendlySize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  onSubmitUpdateProgress() {
    if (this.updateProgressForm.valid) {
      const formVal = this.updateProgressForm.value;
      const progressVal = formVal.status === 'completed' ? 100 : formVal.progress;

      this.projectService.updateProjectProgress(
        formVal.project,
        progressVal,
        formVal.priority,
        formVal.status,
        formVal.description
      ).subscribe({
        next: (updatedProject: Project) => {
          const project = this.projects.find(p => p.name === formVal.project);
          if (project) {
            project.progress = updatedProject.progress;
            project.priority = updatedProject.priority;
            project.status = updatedProject.status;
            project.description = updatedProject.description;
          }
          this.closeUpdateProgressForm();
        },
        error: (err) => {
          console.error('Failed to update project progress:', err);
          alert('Could not update project progress. Please ensure the backend is running.');
        }
      });
    }
  }

  onSubmitLogMeeting() {
    if (this.logMeetingForm.valid) {
      const formVal = this.logMeetingForm.value;

      const newMeeting: Meeting = {
        title: formVal.meetingTitle || 'Unnamed Meeting',
        project: formVal.relatedProject,
        date: formVal.date || '06 Jul 2026',
        time: formVal.time || '12:00 PM',
        minutesOfMeeting: formVal.minutesOfMeeting || 'No MOM provided.',
        attendees: [...this.logMeetingAttendees],
        recordingLength: this.selectedRecording ? '18:40' : undefined,
        filesCount: this.selectedFiles.length
      };

      const currentUser = this.authService.getUser();
      const currentUserId = currentUser ? currentUser.user_id : 1;
      this.meetingService.insertMeeting(newMeeting, currentUserId).subscribe({
        next: (savedMeeting: Meeting) => {
          // Parse returned backend values to UI structure
          const mappedMeeting: Meeting = {
            id: savedMeeting.id,
            title: savedMeeting.title,
            project: savedMeeting.project,
            date: savedMeeting.date,
            time: savedMeeting.time,
            minutesOfMeeting: savedMeeting.minutesOfMeeting,
            attendees: Array.isArray(savedMeeting.attendees) ? savedMeeting.attendees : JSON.parse(savedMeeting.attendees || '[]'),
            recordingLength: savedMeeting.recordingLength,
            filesCount: Number(savedMeeting.filesCount || 0)
          };
          this.meetings.push(mappedMeeting);
          this.sortMeetings();
          this.saveMeetingsToStorage();
          this.closeLogMeetingForm();

          // Reset
          this.selectedRecording = null;
          this.selectedFiles = [];
          this.logMeetingAttendees = ['Jyoti Sharma', 'Client stakeholder'];
          this.logMeetingForm.reset({
            meetingTitle: '',
            relatedProject: this.projects.length > 0 ? this.projects[0].name : '',
            date: this.getTodayDate(),
            time: '',
            attendees: [this.logMeetingAttendees],
            minutesOfMeeting: ''
          });
        },
        error: (err) => {
          console.error('Failed to log meeting:', err);
          alert('Could not save meeting. Please ensure the backend is running.');
        }
      });
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
      },
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
