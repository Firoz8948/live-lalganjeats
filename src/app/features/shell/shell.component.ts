import { Component } from '@angular/core';
import { Router, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <header class="live-topbar">
      <div class="live-topbar__tenant">{{ tenantLabel }}</div>
      <button type="button" class="live-topbar__logout" (click)="logout()">Logout</button>
    </header>

    <router-outlet />

    <nav class="bottom-nav">
      <a routerLink="/live" routerLinkActive="active">
        <span class="nav-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="2" fill="currentColor"/>
            <path d="M16.24 7.76a6 6 0 0 1 0 8.49m-8.48-.01a6 6 0 0 1 0-8.49m11.31-2.82a10 10 0 0 1 0 14.14m-14.14 0a10 10 0 0 1 0-14.14"/>
          </svg>
        </span>
        <span>Live</span>
      </a>
      <a routerLink="/orders" routerLinkActive="active">
        <span class="nav-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
            <rect x="9" y="3" width="6" height="4" rx="1"/>
            <path d="m9 14 2 2 4-4"/>
          </svg>
        </span>
        <span>Orders</span>
      </a>
      <a routerLink="/earnings" routerLinkActive="active">
        <span class="nav-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/>
            <path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/>
            <path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/>
          </svg>
        </span>
        <span>Earnings</span>
      </a>
    </nav>
  `,
})
export class ShellComponent {
  constructor(private api: ApiService, private router: Router) {}

  get tenantLabel(): string {
    const session = this.api.session;
    return session?.tenant_name || session?.full_name || 'Tenant admin';
  }

  logout() {
    this.api.logout();
    this.router.navigate(['/login']);
  }
}
