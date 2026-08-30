import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private base = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  private get headers(): HttpHeaders {
    const token = localStorage.getItem('le_admin_token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    });
  }

  get isLoggedIn(): boolean {
    return !!localStorage.getItem('le_admin_token');
  }

  login(username: string, password: string): Observable<any> {
    return this.http.post(`${this.base}/auth/admin-login`, { username, password });
  }

  saveToken(token: string): void {
    localStorage.setItem('le_admin_token', token);
  }

  logout(): void {
    localStorage.removeItem('le_admin_token');
  }

  getDashboard(): Observable<any> {
    return this.http.get(`${this.base}/admin/dashboard`, { headers: this.headers });
  }

  getCompletedOrders(page: number = 1, pageSize: number = 15): Observable<any> {
    return this.http.get(
      `${this.base}/admin/orders/completed?page=${page}&page_size=${pageSize}`,
      { headers: this.headers }
    );
  }

  getDeliveryEarnings(startDate?: string, endDate?: string): Observable<any> {
    let url = `${this.base}/admin/delivery-earnings`;
    const params: string[] = [];
    if (startDate) params.push(`start_date=${startDate}`);
    if (endDate) params.push(`end_date=${endDate}`);
    if (params.length) url += '?' + params.join('&');
    return this.http.get(url, { headers: this.headers });
  }

  getHotelEarnings(startDate?: string, endDate?: string): Observable<any> {
    let url = `${this.base}/admin/hotel-earnings`;
    const params: string[] = [];
    if (startDate) params.push(`start_date=${startDate}`);
    if (endDate) params.push(`end_date=${endDate}`);
    if (params.length) url += '?' + params.join('&');
    return this.http.get(url, { headers: this.headers });
  }
}
