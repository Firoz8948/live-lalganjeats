import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api.service';

interface LiveOrder {
  id: number;
  order_number: string;
  status: string;
  total_amount: number;
  payment_method: string;
  payment_status: string;
  created_at: string;
  restaurant_name: string;
  restaurant_phone: string;
  delivery_partner_name: string;
  delivery_partner_phone: string;
  customer_name: string;
  customer_phone: string;
  delivery_address: string;
}

const STATUS_STEPS = ['pending', 'accepted', 'ready', 'picked_up', 'delivered'];
const STEP_LABELS: Record<string, string> = {
  pending: 'PEND',
  accepted: 'ACCEPT',
  ready: 'READY',
  picked_up: 'PICKED',
  delivered: '✓',
};

@Component({
  selector: 'app-live',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page">
      <div class="page-header">
        <h1>
          Live Orders
          <span class="badge-count" *ngIf="orders.length">{{ orders.length }}</span>
        </h1>
        <div class="auto-refresh">
          <span class="dot"></span>
          Auto-refreshing every 10s
        </div>
      </div>

      <div class="loading" *ngIf="loading && !orders.length">
        <div class="spinner"></div>
        <p>Loading live orders...</p>
      </div>

      <div class="table-wrapper" *ngIf="orders.length">
        <table>
          <thead>
            <tr>
              <th>Order</th>
              <th>Status</th>
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

      <div class="loading" *ngIf="!loading && !orders.length">
        <p>No active orders right now</p>
      </div>
    </div>
  `,
})
export class LiveComponent implements OnInit, OnDestroy {
  orders: LiveOrder[] = [];
  loading = true;
  statusSteps = STATUS_STEPS;

  private intervalId: any;

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.fetchOrders();
    this.intervalId = setInterval(() => this.fetchOrders(), 10000);
  }

  ngOnDestroy() {
    if (this.intervalId) clearInterval(this.intervalId);
  }

  fetchOrders() {
    this.api.getDashboard().subscribe({
      next: (res: any) => {
        this.orders = res.live_orders || [];
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  isDone(current: string, step: string): boolean {
    const ci = STATUS_STEPS.indexOf(current);
    const si = STATUS_STEPS.indexOf(step);
    return si < ci;
  }

  stepLabel(step: string): string {
    return STEP_LABELS[step] || step.toUpperCase();
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
