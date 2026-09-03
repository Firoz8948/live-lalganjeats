import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export const TOKEN_KEY = 'le_admin_token';
export const USER_KEY = 'le_admin_user';

export interface LiveAdminSession {
  access_token: string;
  role: string;
  user_id?: number;
  full_name?: string | null;
  tenant_id?: number | null;
  tenant_name?: string | null;
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  private base = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  get isLoggedIn(): boolean {
    return !!localStorage.getItem(TOKEN_KEY);
  }

  get session(): LiveAdminSession | null {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? (JSON.parse(raw) as LiveAdminSession) : null;
    } catch {
      return null;
    }
  }

  login(username: string, password: string): Observable<LiveAdminSession> {
    return this.http.post<LiveAdminSession>(`${this.base}/auth/admin-login`, {
      username,
      password,
    });
  }

  saveSession(res: LiveAdminSession): void {
    localStorage.setItem(TOKEN_KEY, res.access_token);
    localStorage.setItem(
      USER_KEY,
      JSON.stringify({
        access_token: res.access_token,
        role: res.role,
        user_id: res.user_id,
        full_name: res.full_name,
        tenant_id: res.tenant_id,
        tenant_name: res.tenant_name,
      }),
    );
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }

  getDashboard(): Observable<any> {
    return this.http.get(`${this.base}/admin/dashboard`);
  }

  getCompletedOrders(page: number = 1, pageSize: number = 15): Observable<any> {
    return this.http.get(
      `${this.base}/admin/orders/completed?page=${page}&page_size=${pageSize}`,
    );
  }

  getDeliveryEarnings(startDate?: string, endDate?: string): Observable<any> {
    let url = `${this.base}/admin/delivery-earnings`;
    const params: string[] = [];
    if (startDate) params.push(`start_date=${startDate}`);
    if (endDate) params.push(`end_date=${endDate}`);
    if (params.length) url += '?' + params.join('&');
    return this.http.get(url);
  }

  getHotelEarnings(startDate?: string, endDate?: string): Observable<any> {
    let url = `${this.base}/admin/hotel-earnings`;
    const params: string[] = [];
    if (startDate) params.push(`start_date=${startDate}`);
    if (endDate) params.push(`end_date=${endDate}`);
    if (params.length) url += '?' + params.join('&');
    return this.http.get(url);
  }
}
