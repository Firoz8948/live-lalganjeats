import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';

interface EarningRow {
  partner_id?: number;
  restaurant_id?: number;
  name: string;
  phone: string;
  total_earned: number;
  settled_amount: number;
  unsettled_amount: number;
  total_orders: number;
}

@Component({
  selector: 'app-earnings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">
      <div class="page-header">
        <h1>Partner Earnings</h1>
      </div>

      <!-- Partner Type Toggle -->
      <div class="partner-type-toggle">
        <button [class.active]="partnerType === 'delivery'" (click)="setPartnerType('delivery')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="18.5" cy="17.5" r="3.5"/>
            <circle cx="5.5" cy="17.5" r="3.5"/>
            <path d="M15 6h-4l-3 8h10l-3-8Z"/>
            <path d="M12 17.5v-3.5"/>
          </svg>
          <span>Delivery Partners</span>
        </button>
        <button [class.active]="partnerType === 'hotel'" (click)="setPartnerType('hotel')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
          <span>Hotel Partners</span>
        </button>
      </div>

      <!-- Date Filter Bar -->
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

      <!-- Summary Metrics Cards -->
      <div class="summary-cards" *ngIf="earnings.length && !loading">
        <div class="summary-card">
          <div class="label">Total Orders</div>
          <div class="val">{{ totalOrders }}</div>
        </div>
        <div class="summary-card">
          <div class="label">Total Earned</div>
          <div class="val earned">₹{{ totalEarned | number:'1.2-2' }}</div>
        </div>
        <div class="summary-card">
          <div class="label">Settled</div>
          <div class="val settled">₹{{ totalSettled | number:'1.2-2' }}</div>
        </div>
        <div class="summary-card">
          <div class="label">Unsettled</div>
          <div class="val unsettled">₹{{ totalUnsettled | number:'1.2-2' }}</div>
        </div>
      </div>

      <div class="loading" *ngIf="loading">
        <div class="spinner"></div>
        <p>Loading earnings...</p>
      </div>

      <!-- Earnings Table -->
      <div class="table-wrapper" *ngIf="earnings.length && !loading">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>{{ partnerType === 'delivery' ? 'Delivery Partner' : 'Hotel / Restaurant' }}</th>
              <th>Phone</th>
              <th>Orders</th>
              <th>Total Earned</th>
              <th>Settled</th>
              <th>Unsettled</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let e of earnings; let i = index">
              <td>{{ i + 1 }}</td>
              <td><strong>{{ e.name || '—' }}</strong></td>
              <td>{{ e.phone || '—' }}</td>
              <td>{{ e.total_orders }}</td>
              <td class="amount">₹{{ e.total_earned | number:'1.2-2' }}</td>
              <td class="text-success">₹{{ e.settled_amount | number:'1.2-2' }}</td>
              <td class="text-warning">₹{{ e.unsettled_amount | number:'1.2-2' }}</td>
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
  partnerType: 'delivery' | 'hotel' = 'delivery';
  earnings: EarningRow[] = [];
  loading = true;
  activeFilter = 'all';
  startDate = '';
  endDate = '';

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.filterAll();
  }

  get totalEarned(): number {
    return this.earnings.reduce((sum, e) => sum + (e.total_earned || 0), 0);
  }

  get totalSettled(): number {
    return this.earnings.reduce((sum, e) => sum + (e.settled_amount || 0), 0);
  }

  get totalUnsettled(): number {
    return this.earnings.reduce((sum, e) => sum + (e.unsettled_amount || 0), 0);
  }

  get totalOrders(): number {
    return this.earnings.reduce((sum, e) => sum + (e.total_orders || 0), 0);
  }

  setPartnerType(type: 'delivery' | 'hotel') {
    if (this.partnerType === type) return;
    this.partnerType = type;
    this.earnings = [];
    this.applyCurrentFilter();
  }

  filterAll() {
    this.activeFilter = 'all';
    this.startDate = '';
    this.endDate = '';
    this.fetchEarnings();
  }

  filterToday() {
    this.activeFilter = 'today';
    const today = new Date();
    const iso = today.toISOString().split('T')[0];
    this.startDate = iso;
    this.endDate = iso;
    this.fetchEarnings(iso, iso + 'T23:59:59');
  }

  filterWeek() {
    this.activeFilter = 'week';
    const now = new Date();
    const dayOfWeek = now.getDay();
    const monday = new Date(now);
    monday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    const startIso = monday.toISOString().split('T')[0];
    const endIso = now.toISOString().split('T')[0];
    this.startDate = startIso;
    this.endDate = endIso;
    this.fetchEarnings(startIso, endIso + 'T23:59:59');
  }

  filterCustom() {
    this.activeFilter = 'custom';
    if (this.startDate && this.endDate) {
      this.fetchEarnings(this.startDate, this.endDate + 'T23:59:59');
    }
  }

  private applyCurrentFilter() {
    if (this.activeFilter === 'today') this.filterToday();
    else if (this.activeFilter === 'week') this.filterWeek();
    else if (this.activeFilter === 'custom') this.filterCustom();
    else this.filterAll();
  }

  fetchEarnings(startDate?: string, endDate?: string) {
    this.loading = true;
    this.earnings = [];
    const req$ = this.partnerType === 'delivery'
      ? this.api.getDeliveryEarnings(startDate, endDate)
      : this.api.getHotelEarnings(startDate, endDate);

    req$.subscribe({
      next: (res: any) => {
        this.earnings = res || [];
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Failed to load earnings', err);
        this.earnings = [];
        this.loading = false;
      },
    });
  }
}

