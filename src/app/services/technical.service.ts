import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { TechnicalStats, LatencyChartData, ScopeChartData } from '../models/technical-stats.model';

@Injectable({
  providedIn: 'root'
})
export class TechnicalService {
  private apiUrl = `${environment.apiUrl}/technical`;

  constructor(private http: HttpClient) {}

  getStats(): Observable<TechnicalStats> {
    return this.http.get<TechnicalStats>(`${this.apiUrl}/stats`);
  }

  getLatencyChart(): Observable<LatencyChartData> {
    return this.http.get<LatencyChartData>(`${this.apiUrl}/latency-chart`);
  }

  getScopeChart(): Observable<ScopeChartData> {
    return this.http.get<ScopeChartData>(`${this.apiUrl}/scope-chart`);
  }
}
