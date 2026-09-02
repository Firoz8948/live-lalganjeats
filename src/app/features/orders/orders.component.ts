import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api.service';
import { isVerifiedPaymentMode, paymentModeLabel } from '../../core/payment-mode';

const STATUS_STEPS = ['pending', 'accepted', 'ready', 'picked_up', 'delivered'];
const STEP_LABELS: Record<string, string> = {
  pending: 'PEND',
  accepted: 'ACCEPT',
  ready: 'READY',
  picked_up: 'PICKED',
  delivered: '✓',
};

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page">
      <div class="page-header">
        <h1>Completed Orders</h1>
        <div class="subtitle" *ngIf="total">{{ total }} total delivered orders</div>
      </div>

      <div class="loading" *ngIf="loading">
        <div class="spinner"></div>
        <p>Loading orders...</p>
      </div>

      <div class="table-wrapper" *ngIf="orders.length">
        <table>
          <thead>
            <tr>
              <th>Order</th>
              <th>Status</th>
              <th>Mode</th>
              <th>Amount</th>
              <th>Time</th>
              <th>Customer</th>
              <th>Restaurant</th>
              <th>Delivery Partner</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let o of orders">
              <td><strong>{{ o.order_number }}</strong></td>
              <td>
                <div class="status-pipeline">
                  <span *ngFor="let step of statusSteps"
                        class="status-step"
                        [class.done]="isDone(o.status, step)"
                        [class.active]="o.status === step">
                    {{ stepLabel(step) }}
                  </span>
                </div>
              </td>
              <td>
                <span class="mode-pill" [class.verified]="isVerifiedMode(o)">
                  {{ modeLabel(o) }}
                  <ng-container *ngIf="isVerifiedMode(o)"> ✓</ng-container>
                </span>
              </td>
              <td class="amount">₹{{ o.total_amount | number:'1.2-2' }}</td>
              <td>{{ formatTime(o.created_at) }}</td>
              <td>
                <div class="cell-info">
                  <div class="name">{{ o.customer_name || '—' }}</div>
                  <div class="phone">{{ o.customer_phone || '' }}</div>
                  <div class="address">{{ o.delivery_address || '' }}</div>
                </div>
              </td>
              <td>
                <div class="cell-info">
                  <div class="name">{{ o.restaurant_name || '—' }}</div>
                  <div class="phone">{{ o.restaurant_phone || '' }}</div>
                </div>
              </td>
              <td>
                <div class="cell-info">
                  <div class="name">{{ o.delivery_partner_name || '—' }}</div>
                  <div class="phone">{{ o.delivery_partner_phone || '' }}</div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="pagination" *ngIf="totalPages > 1">
        <button (click)="goPage(page - 1)" [disabled]="page <= 1">← Prev</button>
        <span class="page-info">Page {{ page }} of {{ totalPages }}</span>
        <button (click)="goPage(page + 1)" [disabled]="page >= totalPages">Next →</button>
      </div>

      <div class="loading" *ngIf="!loading && !orders.length">
        <p>No completed orders yet</p>
      </div>
    </div>
  `,
})
export class OrdersComponent implements OnInit {
  orders: any[] = [];
  loading = true;
  page = 1;
  totalPages = 1;
  total = 0;
  statusSteps = STATUS_STEPS;

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.fetchOrders();
  }

  fetchOrders() {
    this.loading = true;
    this.api.getCompletedOrders(this.page, 15).subscribe({
      next: (res: any) => {
        this.orders = res.orders || [];
        this.total = res.total || 0;
        this.totalPages = res.total_pages || 1;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  goPage(p: number) {
    if (p < 1 || p > this.totalPages) return;
    this.page = p;
    this.fetchOrders();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  isDone(current: string, step: string): boolean {
    const ci = STATUS_STEPS.indexOf(current);
    const si = STATUS_STEPS.indexOf(step);
    return si < ci;
  }

  stepLabel(step: string): string {
    return STEP_LABELS[step] || step.toUpperCase();
  }

  modeLabel(order: any): string {
    return paymentModeLabel(order);
  }

  isVerifiedMode(order: any): boolean {
    return isVerifiedPaymentMode(order);
  }

  formatTime(iso: string): string {
    if (!iso) return '—';
    const d = new Date(iso);
    const day = d.getDate();
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const month = months[d.getMonth()];
    let h = d.getHours();
    const m = d.getMinutes().toString().padStart(2, '0');
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return `${day} ${month}, ${h}:${m} ${ampm}`;
  }
}
