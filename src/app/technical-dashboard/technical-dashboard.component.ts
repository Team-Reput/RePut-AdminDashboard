import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import * as Highcharts from 'highcharts';
import { HighchartsChartModule } from 'highcharts-angular';
import { RouterModule } from '@angular/router';
import { ProjectsHealthMonitoringComponent } from './projects-health-monitoring/projects-health-monitoring.component';
import { Project } from '../models/project.model';
import { ProjectService } from '../services/project.service';
import { ReviewMeetingsComponent } from './review-meetings/review-meetings.component';
import { Meeting } from '../models/meeting.model';
import { MeetingService } from '../services/meeting.service';

@Component({
  selector: 'app-technical-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, HighchartsChartModule, RouterModule, ProjectsHealthMonitoringComponent, ReviewMeetingsComponent],
  templateUrl: './technical-dashboard.component.html',
  styleUrl: './technical-dashboard.component.scss'
})
export class TechnicalDashboardComponent {
  username = 'John Doe';
  Highcharts = Highcharts;
  loanDisbursementChartOptions: any;
  pieChartOptions: any;
  
  projects: Project[] = [];
  meetings: Meeting[] = [];
  
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
    private meetingService: MeetingService
  ){}

  ngOnInit(): void {
    // New Project Form Initialization
    this.newProjectForm = this.fb.group({
      projectName: ['', Validators.required],
      clientName: [''],
      clientContact: [''],
      parentProject: [''],
      startDate: ['06-07-2026'],
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
      notes: ['']
    });

    // Log Meeting Form Initialization
    this.logMeetingForm = this.fb.group({
      meetingTitle: [''],
      relatedProject: ['E-commerce platform revamp'],
      date: ['06-07-2026'],
      time: [''],
      attendees: [this.logMeetingAttendees],
      minutesOfMeeting: ['']
    });

    this.setLoanDisbursementChart();
    this.setPieChart();
    this.initializeProjects();
    this.initializeMeetings();
  }

  initializeProjects() {
    const stored = localStorage.getItem('reput_projects');
    if (stored) {
      this.projects = JSON.parse(stored);
    } else {
      const defaultProjects: Project[] = [
        {
          id: '1',
          name: 'E-commerce platform revamp',
          client: 'Acme Textiles',
          deadline: '18 Jul 2026',
          priority: 'high',
          status: 'progress',
          progress: 65,
          teamMembers: ['Jyoti Sharma', 'Rahul Verma', 'John Doe', 'Partner Manager']
        },
        {
          id: '2',
          name: 'Payment gateway integration',
          client: 'Acme Textiles',
          parentProject: 'E-commerce platform revamp',
          deadline: '12 Jul 2026',
          priority: 'medium',
          status: 'progress',
          progress: 40,
          teamMembers: ['Rahul Verma']
        },
        {
          id: '3',
          name: 'API Migration',
          client: 'Internal',
          deadline: '30 Aug 2026',
          priority: 'medium',
          status: 'hold',
          progress: 20,
          teamMembers: ['Ankit Kumar']
        },
        {
          id: '4',
          name: 'Mobile App v2',
          client: 'Nimbus Retail',
          deadline: '28 Jun 2026',
          priority: 'low',
          status: 'completed',
          progress: 100,
          teamMembers: ['Jyoti Sharma', 'Piyush Joshi']
        }
      ];
      this.projects = defaultProjects;
      this.saveProjectsToStorage();
    }
  }

  saveProjectsToStorage() {
    localStorage.setItem('reput_projects', JSON.stringify(this.projects));
  }

  initializeMeetings() {
    const currentUserId = 1; // Replace with logged-in user id
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
          this.saveMeetingsToStorage();
        } else {
          this.useDefaultMeetings();
        }
      },
      error: (err) => {
        console.error('Error fetching meetings from database, falling back to storage:', err);
        const stored = localStorage.getItem('reput_meetings');
        if (stored) {
          this.meetings = JSON.parse(stored);
        } else {
          this.useDefaultMeetings();
        }
      }
    });
  }

  useDefaultMeetings() {
    const defaultMeetings: Meeting[] = [
      {
        id: '20260706140000',
        title: 'Sprint review – week 12',
        project: 'E-commerce platform revamp',
        date: '06 Jul 2026',
        time: '2:00 PM',
        minutesOfMeeting: 'Approved final checkout flow; payment gateway sub-project pushed by 5 days due to sandbox delays. Action: Rahul to share updated API docs by Thu.',
        attendees: ['Jyoti Sharma', 'Rahul Verma', 'John Doe'],
        recordingLength: '24:18',
        filesCount: 2
      },
      {
        id: '20260629113000',
        title: 'API Migration – kickoff',
        project: 'API Migration',
        date: '29 Jun 2026',
        time: '11:30 AM',
        minutesOfMeeting: "Migration scope frozen to auth + billing services only. Aman flagged staging environment isn't ready — project moved to On Hold until infra ticket closes.",
        attendees: ['Ankit Kumar', 'Jyoti Sharma'],
        filesCount: 1
      },
      {
        id: '20260625160000',
        title: 'Client sign-off call',
        project: 'Mobile App v2',
        date: '25 Jun 2026',
        time: '4:00 PM',
        minutesOfMeeting: 'Outcome: Client approved final build for release. No blockers raised. Delivery marked complete same day — see project card for status.',
        attendees: ['Jyoti Sharma', 'Piyush Joshi', 'Client stakeholder', 'John Doe'],
        recordingLength: '41:02',
        filesCount: 0
      }
    ];
    this.meetings = defaultMeetings;
    this.saveMeetingsToStorage();
  }

  saveMeetingsToStorage() {
    localStorage.setItem('reput_meetings', JSON.stringify(this.meetings));
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
      status: project.status
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

      const currentUserId = 1; // Replace with logged-in user id if authentication is set up
      this.projectService.insertProject(newProj, currentUserId).subscribe({
        next: (savedProject: Project) => {
          this.projects.push(savedProject);
          this.saveProjectsToStorage();
          this.closeNewProjectForm();

          // Reset team member pickers
          this.newProjectTeamMembers = ['Jyoti Sharma', 'Rahul Verma'];
          this.newProjectForm.reset({
            projectName: '',
            clientName: '',
            clientContact: '',
            parentProject: '',
            startDate: '06-07-2026',
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

  onSubmitUpdateProgress() {
    if (this.updateProgressForm.valid) {
      const formVal = this.updateProgressForm.value;
      const progressVal = formVal.status === 'completed' ? 100 : formVal.progress;

      this.projectService.updateProjectProgress(
        formVal.project,
        progressVal,
        formVal.priority,
        formVal.status
      ).subscribe({
        next: (updatedProject: Project) => {
          const project = this.projects.find(p => p.name === formVal.project);
          if (project) {
            project.progress = updatedProject.progress;
            project.priority = updatedProject.priority;
            project.status = updatedProject.status;
            this.saveProjectsToStorage();
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
        recordingLength: formVal.minutesOfMeeting.toLowerCase().includes('recording') ? '15:00' : undefined,
        filesCount: 1
      };

      const currentUserId = 1; // Replace with logged-in user id if authentication is set up
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
          this.saveMeetingsToStorage();
          this.closeLogMeetingForm();

          // Reset
          this.logMeetingAttendees = ['Jyoti Sharma', 'Client stakeholder'];
          this.logMeetingForm.reset({
            meetingTitle: '',
            relatedProject: this.projects.length > 0 ? this.projects[0].name : '',
            date: '06-07-2026',
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
