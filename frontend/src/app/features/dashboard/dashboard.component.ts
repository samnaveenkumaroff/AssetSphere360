import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AppShellComponent } from '../../shared/components/app-shell.component';
import { DashboardService } from '../../core/services/dashboard.service';
import { DashboardSummary } from '../../core/models/dashboard.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatProgressSpinnerModule, AppShellComponent],
  template: `
    <app-shell></app-shell>

    <main class="as-main">
      @if (loading()) {
        <div class="as-loading"><mat-spinner diameter="32" /></div>
      } @else if (error()) {
        <div class="as-card as-error-panel">
          <mat-icon>error_outline</mat-icon>
          <span>Could not load dashboard data. {{ error() }}</span>
        </div>
      } @else if (summary()) {
        <div class="as-stat-row">
          <div class="as-stat as-card">
            <span class="as-stat__label">Total Products</span>
            <span class="as-stat__value as-mono">{{ summary()!.totalProducts }}</span>
          </div>
          <div class="as-stat as-card">
            <span class="as-stat__label">Categories</span>
            <span class="as-stat__value as-mono">{{ summary()!.totalCategories }}</span>
          </div>
          <div class="as-stat as-card">
            <span class="as-stat__label">Active Suppliers</span>
            <span class="as-stat__value as-mono">{{ summary()!.totalSuppliers }}</span>
          </div>
          <div class="as-stat as-card" [class.as-stat--alert]="summary()!.lowStockCount > 0">
            <span class="as-stat__label">Low Stock</span>
            <span class="as-stat__value as-mono">{{ summary()!.lowStockCount }}</span>
          </div>
          <div class="as-stat as-card as-stat--accent">
            <span class="as-stat__label">Stock Value</span>
            <span class="as-stat__value as-mono">₹{{ summary()!.totalStockValue | number:'1.0-0' }}</span>
          </div>
        </div>

        @if (summary()!.lowStockProducts.length > 0) {
          <section class="as-card as-alert-panel">
            <div class="as-alert-panel__header">
              <mat-icon>warning</mat-icon>
              <span>Reorder Required</span>
            </div>
            <table class="as-alert-table">
              <tbody>
                @for (item of summary()!.lowStockProducts; track item.id) {
                  <tr>
                    <td class="as-mono as-alert-table__sku">{{ item.sku }}</td>
                    <td>{{ item.name }}</td>
                    <td class="as-mono as-alert-table__qty">
                      {{ item.currentStock }} / {{ item.reorderLevel }}
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </section>
        } @else {
          <div class="as-card as-empty-panel">
            <mat-icon>check_circle</mat-icon>
            <span>All stock levels healthy. No reorders needed.</span>
          </div>
        }
      }
    </main>
  `,
  styles: [`
    .as-main { padding: 24px; max-width: 1280px; margin: 0 auto; }
    .as-loading { display: flex; justify-content: center; padding: 64px; }
    .as-error-panel, .as-empty-panel {
      display: flex; align-items: center; gap: 10px; padding: 20px; color: var(--as-ink-muted);
    }
    .as-error-panel { color: var(--as-critical); }
    .as-empty-panel mat-icon { color: var(--as-stock-in); }

    .as-stat-row {
      display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 12px; margin-bottom: 20px;
    }
    .as-stat { padding: 18px; display: flex; flex-direction: column; gap: 6px; }
    .as-stat__label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.06em; color: var(--as-ink-muted); }
    .as-stat__value { font-size: 26px; font-weight: 600; color: var(--as-ink-text); }
    .as-stat--alert { border-color: var(--as-critical); background: var(--as-critical-bg); }
    .as-stat--alert .as-stat__value { color: var(--as-critical); }
    .as-stat--accent { border-color: var(--as-stock-in); background: var(--as-stock-in-bg); }
    .as-stat--accent .as-stat__value { color: var(--as-stock-in); }

    .as-alert-panel { padding: 0; overflow: hidden; }
    .as-alert-panel__header {
      display: flex; align-items: center; gap: 8px; padding: 14px 18px;
      background: var(--as-critical-bg); color: var(--as-critical); font-weight: 600; font-size: 13px;
    }
    .as-alert-table { width: 100%; border-collapse: collapse; }
    .as-alert-table td { padding: 10px 18px; border-bottom: 1px solid var(--as-border); font-size: 13px; }
    .as-alert-table tr:last-child td { border-bottom: none; }
    .as-alert-table__sku { color: var(--as-ink-muted); width: 160px; }
    .as-alert-table__qty { text-align: right; color: var(--as-critical); font-weight: 600; }
  `]
})
export class DashboardComponent implements OnInit {
  private readonly dashboardService = inject(DashboardService);

  readonly summary = signal<DashboardSummary | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  ngOnInit(): void {
    this.dashboardService.getSummary().subscribe({
      next: (data) => {
        this.summary.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message ?? err.message ?? 'Unknown error');
        this.loading.set(false);
      }
    });
  }
}
