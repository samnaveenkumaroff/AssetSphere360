import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DashboardService } from '../../core/services/dashboard.service';
import { AuthService } from '../../core/services/auth.service';
import { DashboardSummary } from '../../core/models/dashboard.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule, RouterLink, MatCardModule, MatToolbarModule,
    MatIconModule, MatListModule, MatChipsModule, MatProgressSpinnerModule
  ],
  template: `
    <mat-toolbar color="primary">
      <span>AssetSphere 360 — Dashboard</span>
      <span class="spacer"></span>
      <span class="user-name">{{ authService.currentUser()?.fullName }}</span>
      <button mat-icon-button routerLink="/products"><mat-icon>inventory_2</mat-icon></button>
      <button mat-icon-button (click)="authService.logout()"><mat-icon>logout</mat-icon></button>
    </mat-toolbar>

    <div class="page-container">
      @if (loading()) {
        <div class="spinner-container"><mat-spinner /></div>
      } @else if (summary()) {
        <div class="stats-grid">
          <mat-card class="stat-card">
            <mat-icon class="stat-icon">inventory_2</mat-icon>
            <div class="stat-value">{{ summary()!.totalProducts }}</div>
            <div class="stat-label">Total Products</div>
          </mat-card>

          <mat-card class="stat-card">
            <mat-icon class="stat-icon">category</mat-icon>
            <div class="stat-value">{{ summary()!.totalCategories }}</div>
            <div class="stat-label">Categories</div>
          </mat-card>

          <mat-card class="stat-card">
            <mat-icon class="stat-icon">local_shipping</mat-icon>
            <div class="stat-value">{{ summary()!.totalSuppliers }}</div>
            <div class="stat-label">Active Suppliers</div>
          </mat-card>

          <mat-card class="stat-card" [class.warn-card]="summary()!.lowStockCount > 0">
            <mat-icon class="stat-icon">warning</mat-icon>
            <div class="stat-value">{{ summary()!.lowStockCount }}</div>
            <div class="stat-label">Low Stock Items</div>
          </mat-card>

          <mat-card class="stat-card stock-value-card">
            <mat-icon class="stat-icon">payments</mat-icon>
            <div class="stat-value">₹{{ summary()!.totalStockValue | number:'1.0-2' }}</div>
            <div class="stat-label">Total Stock Value</div>
          </mat-card>
        </div>

        @if (summary()!.lowStockProducts.length > 0) {
          <mat-card class="low-stock-section">
            <mat-card-header>
              <mat-card-title>Low Stock Alerts</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <mat-list>
                @for (item of summary()!.lowStockProducts; track item.id) {
                  <mat-list-item>
                    <span matListItemTitle>{{ item.name }} ({{ item.sku }})</span>
                    <span matListItemLine>
                      Stock: {{ item.currentStock }} / Reorder at: {{ item.reorderLevel }}
                    </span>
                    <mat-chip color="warn" highlighted>Reorder Now</mat-chip>
                  </mat-list-item>
                }
              </mat-list>
            </mat-card-content>
          </mat-card>
        }
      }
    </div>
  `,
  styles: [`
    .spacer { flex: 1 1 auto; }
    .user-name { margin-right: 12px; font-size: 14px; }
    .page-container { padding: 24px; max-width: 1200px; margin: 0 auto; }
    .spinner-container { display: flex; justify-content: center; padding: 48px; }
    .stats-grid {
      display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px; margin-bottom: 24px;
    }
    .stat-card {
      display: flex; flex-direction: column; align-items: center;
      padding: 24px; text-align: center;
    }
    .warn-card { border-left: 4px solid #c62828; }
    .stock-value-card { border-left: 4px solid #2e7d32; }
    .stat-icon { font-size: 32px; height: 32px; width: 32px; margin-bottom: 8px; color: #1976d2; }
    .stat-value { font-size: 28px; font-weight: 600; }
    .stat-label { font-size: 13px; color: #666; margin-top: 4px; }
    .low-stock-section { margin-top: 16px; }
  `]
})
export class DashboardComponent implements OnInit {
  private readonly dashboardService = inject(DashboardService);
  readonly authService = inject(AuthService);

  readonly summary = signal<DashboardSummary | null>(null);
  readonly loading = signal(true);

  ngOnInit(): void {
    this.dashboardService.getSummary().subscribe({
      next: (data) => { this.summary.set(data); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }
}
