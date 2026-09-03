import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="login-page">
      <div class="login-card">
        <h1><span class="orange">Lalganj</span><span class="black">Eats</span></h1>
        <p class="tagline">Live Orders · Tenant admin</p>
        <p class="login-hint">Use the same email and password as your admin portal.</p>

        <form (ngSubmit)="onLogin()">
          <div class="form-group">
            <label>Email / Username</label>
            <input
              type="text"
              [(ngModel)]="username"
              name="username"
              placeholder="Tenant admin email"
              required
              autocomplete="username">
          </div>
          <div class="form-group">
            <label>Password</label>
            <input
              type="password"
              [(ngModel)]="password"
              name="password"
              placeholder="Admin portal password"
              required
              autocomplete="current-password">
          </div>
          <button type="submit" class="btn-primary" [disabled]="loading">
            {{ loading ? 'Logging in...' : 'Login' }}
          </button>
          <p class="error-msg" *ngIf="error">{{ error }}</p>
        </form>
      </div>
    </div>
  `,
})
export class LoginComponent {
  username = '';
  password = '';
  loading = false;
  error = '';

  constructor(private api: ApiService, private router: Router) {
    if (this.api.isLoggedIn) {
      this.router.navigate(['/live']);
    }
  }

  onLogin() {
    this.loading = true;
    this.error = '';
    this.api.login(this.username, this.password).subscribe({
      next: (res) => {
        if (res.role !== 'admin' || !res.tenant_id) {
          this.error = 'Access denied. Use a tenant admin login created by super admin.';
          this.loading = false;
          return;
        }
        this.api.saveSession(res);
        this.router.navigate(['/live']);
      },
      error: (err) => {
        const status = err?.status;
        if (status === 0) {
          this.error = 'Cannot reach the server. Check your connection.';
        } else {
          this.error =
            err?.error?.detail || 'Login failed. Use your tenant admin email and password.';
        }
        this.loading = false;
      },
    });
  }
}
