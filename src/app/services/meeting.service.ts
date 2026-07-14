import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Meeting } from '../models/meeting.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MeetingService {
  private apiUrl = `${environment.apiUrl}/meetings`;

  constructor(private http: HttpClient) {}

  insertMeeting(meeting: Meeting, userId: number): Observable<Meeting> {
    const payload = {
      p_user_id: userId,
      p_meeting_title: meeting.title,
      p_project_name: meeting.project,
      p_meeting_date: meeting.date,
      p_meeting_time: meeting.time,
      p_attendees: JSON.stringify(meeting.attendees),
      p_mom: meeting.minutesOfMeeting,
      p_recording: meeting.recordingLength || '',
      p_files: meeting.filesCount.toString()
    };

    return this.http.post<Meeting>(this.apiUrl, payload);
  }

  getMeetingsByUser(userId: number): Observable<Meeting[]> {
    return this.http.get<Meeting[]>(`${this.apiUrl}/user/${userId}`);
  }
}
