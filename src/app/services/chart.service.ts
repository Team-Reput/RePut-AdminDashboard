import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface SavedChart {
  id: number;
  userId: number;
  chartTitle: string;
  yAxisLabel: string;
  dataPoints: Array<{ month: string; value: number }>;
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class ChartService {
  private apiUrl = `${environment.apiUrl}/charts`;

  constructor(private http: HttpClient) {}

  /**
   * Get all saved charts for a specific user
   */
  getSavedCharts(userId: number): Observable<SavedChart[]> {
    return this.http.get<SavedChart[]>(`${this.apiUrl}/user/${userId}`);
  }

  /**
   * Save a new generated chart
   */
  saveChart(payload: {
    user_id: number;
    chartTitle: string;
    yAxisLabel: string;
    dataPoints: Array<{ month: string; value: number }>;
  }): Observable<any> {
    return this.http.post<any>(this.apiUrl, payload);
  }

  /**
   * Delete a saved chart by its ID
   */
  deleteChart(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}
