import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: 'login', loadComponent: () => import('./features/login/login.component').then(m => m.LoginComponent) },
  {
    path: '',
    canActivate: [AuthGuard],
    loadComponent: () => import('./features/shell/shell.component').then(m => m.ShellComponent),
    children: [
      { path: '', redirectTo: 'live', pathMatch: 'full' },
      { path: 'live', loadComponent: () => import('./features/live/live.component').then(m => m.LiveComponent) },
      { path: 'orders', loadComponent: () => import('./features/orders/orders.component').then(m => m.OrdersComponent) },
      { path: 'earnings', loadComponent: () => import('./features/earnings/earnings.component').then(m => m.EarningsComponent) },
    ],
  },
  { path: '**', redirectTo: '' },
];
