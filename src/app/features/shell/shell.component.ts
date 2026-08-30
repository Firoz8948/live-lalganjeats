import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <router-outlet />

    <nav class="bottom-nav">
      <a routerLink="/live" routerLinkActive="active">
        <span class="nav-icon">📡</span>
        Live
      </a>
      <a routerLink="/orders" routerLinkActive="active">
        <span class="nav-icon">📋</span>
        Orders
      </a>
      <a routerLink="/earnings" routerLinkActive="active">
        <span class="nav-icon">💰</span>
        Earnings
      </a>
    </nav>
  `,
})
export class ShellComponent {}
