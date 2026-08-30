import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';

interface PartnerEarning {
  partner_id: number;
  name: string;
  phone: string;
  total_earned: number;
  total_orders: number;
}

@Component({
  selector: 'app-earnings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">
      <div class="page-header">
        <h1>Delivery Partner Earnings</h1>
      </div>

      <div class="filter-bar">
        <button [class.active]="activeFilter === 'today'" (click)="filterToday()">Today</button>
        <button [class.active]="activeFilter === 'week'" (click)="filterWeek()">This Week</button>
        <button [class.active]="activeFilter === 'all'" (click)="filterAll()">All Time</button>
        <button [class.active]="activeFilter === 'custom'" (click)="activeFilter = 'custom'">Custom</button>

        <ng-container *ngIf="activeFilter === 'custom'">
          <input type="date" [(ngModel)]="startDate" (change)="filterCustom()">
          <span>to</span>
          <input type="date" [(ngModel)]="endDate" (change)="filterCustom()">
        </ng-container>
      </div>

      <div class="earnings-total" *ngIf="earnings.length">
        Total: ₹{{ grandTotal | number:'1.2-2' }} across {{ totalOrders }} orders
      </div>

      <div class="loading" *ngIf="loading">
        <div class="spinner"></div>
        <p>Loading earnings...</p>
      </div>

      <div class="table-wrapper" *ngIf="earnings.length">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Partner Name</th>
              <th>Phone</th>
              <th>Orders</th>
              <th>Total Earned</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let e of earnings; let i = index">
              <td>{{ i + 1 }}</td>
              <td><strong>{{ e.name || '—' }}</strong></td>
              <td>{{ e.phone || '—' }}</td>
              <td>{{ e.total_orders }}</td>
              <td class="amount">₹{{ e.total_earned | number:'1.2-2' }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="loading" *ngIf="!loading && !earnings.length">
        <p>No earnings data found for this period</p>
      </div>
    </div>
  `,
})
export class EarningsComponent implements OnInit {
  earnings: PartnerEarning[] = [];
  loading = true;
  activeFilter = 'all';
  startDate = '';
  endDate = '';

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.filterAll();
  }

  get grandTotal(): number {
    return this.earnings.reduce((sum, e) => sum + e.total_earned, 0);
  }

  get totalOrders(): number {
    return this.earnings.reduce((sum, e) => sum + e.total_orders, 0);
  }

  filterAll() {
    this.activeFilter = 'all';
    this.fetchEarnings();
  }

  filterToday() {
    this.activeFilter = 'today';
    const today = new Date();
    const iso = today.toISOString().split('T')[0];
    this.fetchEarnings(iso, iso + 'T23:59:59');
  }

  filterWeek() {
    this.activeFilter = 'week';
    const now = new Date();
    const dayOfWeek = now.getDay();
    const monday = new Date(now);
    monday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    this.fetchEarnings(monday.toISOString().split('T')[0], now.toISOString().split('T')[0] + 'T23:59:59');
  }

  filterCustom() {
    this.activeFilter = 'custom';
    if (this.startDate && this.endDate) {
      this.fetchEarnings(this.startDate, this.endDate + 'T23:59:59');
    }
  }

  fetchEarnings(startDate?: string, endDate?: string) {
    this.loading = true;
    this.api.getDeliveryEarnings(startDate, endDate).subscribe({
      next: (res: any) => {
        this.earnings = res || [];
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }
}
