import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface SalesEntry {
  id?: string;
  date: string;
  leadStatus: string;
  newCustomers: number;
  offersMade: number;
  expectedRevenue: number;
  churnLostDeals: number;
  pipelineProgress: string;
  obstaclesBlockers: string;
}

export interface FinancialEntry {
  id?: string;
  month: string;
  year: string;
  startDate: string;
  endDate: string;
  totalRevenue: number;
  saasRevenue: number;
  salesMarketingCost: number;
  travelReimbursements: number;
  adminExpenses: number;
  otherExpenses?: number;
}

@Injectable({
  providedIn: 'root'
})
export class SalesService {
  private salesUrl = `${environment.apiUrl}/sales`;
  private financialUrl = `${environment.apiUrl}/financial`;

  constructor(private http: HttpClient) {}

  // Sales Entry Endpoints
  insertSalesEntry(entry: SalesEntry, userId: number): Observable<any> {
    const payload = {
      p_user_id: userId,
      p_entry_date: entry.date,
      p_lead_status: entry.leadStatus,
      p_new_customers: entry.newCustomers,
      p_offers_made: entry.offersMade,
      p_expected_revenue: entry.expectedRevenue,
      p_churn_lost_deals: entry.churnLostDeals,
      p_pipeline_progress: entry.pipelineProgress || '',
      p_obstacles_blockers: entry.obstaclesBlockers || ''
    };
    return this.http.post<any>(this.salesUrl, payload);
  }

  getSalesEntries(userId: number): Observable<SalesEntry[]> {
    return this.http.get<SalesEntry[]>(`${this.salesUrl}/user/${userId}`);
  }

  getSalesDashboardSummary(userId: number): Observable<{
    totalCustomers: number;
    totalOffers: number;
    expectedRevenue: number;
    churn: number;
  }> {
    return this.http.get<{
      totalCustomers: number;
      totalOffers: number;
      expectedRevenue: number;
      churn: number;
    }>(`${this.salesUrl}/dashboard/${userId}`);
  }

  // Financial Entry Endpoints
  insertFinancialEntry(entry: FinancialEntry, userId: number): Observable<any> {
    const payload = {
      p_user_id: userId,
      p_entry_month: entry.month,
      p_entry_year: parseInt(entry.year, 10),
      p_start_date: entry.startDate,
      p_end_date: entry.endDate,
      p_total_revenue: entry.totalRevenue,
      p_saas_revenue: entry.saasRevenue,
      p_sales_marketing_cost: entry.salesMarketingCost,
      p_travel_reimbursements: entry.travelReimbursements,
      p_admin_expenses: entry.adminExpenses,
      p_other_expenses: entry.otherExpenses || 0
    };
    return this.http.post<any>(this.financialUrl, payload);
  }

  getFinancialEntries(userId: number): Observable<FinancialEntry[]> {
    return this.http.get<FinancialEntry[]>(`${this.financialUrl}/user/${userId}`);
  }
}
