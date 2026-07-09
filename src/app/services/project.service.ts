import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Project } from '../models/project.model';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private apiUrl = 'http://localhost:3000/api/projects';

  constructor(private http: HttpClient) {}

  insertProject(project: Project, userId: number): Observable<Project> {
    // Map form properties to Postgres function parameter names
    const payload = {
      p_user_id: userId,
      p_project_name: project.name,
      p_client_name: project.client,
      p_client_contact: project.clientContact || '',
      p_parent_project: project.parentProject || '',
      p_start_date: project.startDate || new Date().toISOString().split('T')[0],
      p_deadline: project.deadline || '',
      p_priority: project.priority,
      p_team_members: JSON.stringify(project.teamMembers),
      p_status: project.status,
      p_description: project.description || '',
      p_updated_progress: project.progress
    };

    return this.http.post<Project>(this.apiUrl, payload);
  }

  updateProjectProgress(projectName: string, progress: number, priority: string, status: string): Observable<Project> {
    const payload = {
      p_project_name: projectName,
      p_updated_progress: progress,
      p_priority: priority,
      p_status: status
    };

    return this.http.put<Project>(this.apiUrl, payload);
  }
}
