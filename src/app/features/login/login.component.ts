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
        <p class="tagline">Live Orders Dashboard</p>

        <form (ngSubmit)="onLogin()">
          <div class="form-group">
            <label>Phone Number</label>
            <input type="tel" [(ngModel)]="phone" name="phone" placeholder="Enter phone number" required>
          </div>
          <div class="form-group">
            <label>Password</label>
            <input type="password" [(ngModel)]="password" name="password" placeholder="Enter password" required>
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
  phone = '';
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
    this.api.login(this.phone, this.password).subscribe({
      next: (res: any) => {
        const role = res.role || '';
        if (!['admin', 'super_admin'].includes(role)) {
          this.error = 'Access denied. Admin login required.';
          this.loading = false;
          return;
        }
        this.api.saveToken(res.access_token);
        this.router.navigate(['/live']);
      },
      error: (err: any) => {
        this.error = err?.error?.detail || 'Login failed. Check credentials.';
        this.loading = false;
      },
    });
  }
}
