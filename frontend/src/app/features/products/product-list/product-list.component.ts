import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AppShellComponent } from '../../../shared/components/app-shell.component';
import { StockGaugeComponent } from '../../../shared/components/stock-gauge.component';
import { ProductsService } from '../../../core/services/products.service';
import { AuthService } from '../../../core/services/auth.service';
import { ReportsService } from '../../../core/services/reports.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Product } from '../../../core/models/product.model';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [
    CommonModule, RouterLink, MatIconModule, MatMenuModule, MatProgressSpinnerModule,
    AppShellComponent, StockGaugeComponent
  ],
  template: `
    <app-shell></app-shell>

    <main class="as-main">
      <div class="as-page-header">
        <div>
          <h1 class="as-page-title">Products</h1>
          <p class="as-page-subtitle">{{ products().length }} items tracked</p>
        </div>
        <div class="as-page-actions">
          <button class="as-btn as-btn--ghost" [matMenuTriggerFor]="exportMenu">
            <mat-icon>file_download</mat-icon> Export
          </button>
          <mat-menu #exportMenu="matMenu">
            <button mat-menu-item (click)="exportExcel()">Excel (.xlsx)</button>
            <button mat-menu-item (click)="exportPdf()">PDF</button>
          </mat-menu>
          @if (authService.isManagerUp()) {
            <a routerLink="/products/new" class="as-btn as-btn--primary">
              <mat-icon>add</mat-icon> New Product
            </a>
          }
        </div>
      </div>

      @if (loading()) {
        <div class="as-loading"><mat-spinner diameter="32" /></div>
      } @else if (products().length === 0) {
        <div class="as-card as-empty-state">
          <mat-icon>inventory_2</mat-icon>
          <p>No products yet. Create your first one to start tracking inventory.</p>
        </div>
      } @else {
        <div class="as-card">
          <table class="as-table">
            <thead>
              <tr>
                <th>SKU</th>
                <th>Name</th>
                <th>Category</th>
                <th>Stock</th>
                <th class="as-table__right">Price</th>
                <th class="as-table__right">Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (p of products(); track p.id) {
                <tr>
                  <td class="as-mono as-table__sku">{{ p.sku }}</td>
                  <td>{{ p.name }}</td>
                  <td class="as-table__muted">{{ p.categoryName }}</td>
                  <td>
                    <app-stock-gauge [currentStock]="p.currentStock" [reorderLevel]="p.reorderLevel" />
                  </td>
                  <td class="as-mono as-table__right">{{ p.sellingCurrency }} {{ p.sellingAmount | number:'1.2-2' }}</td>
                  <td class="as-table__right as-table__actions">
                    <a [routerLink]="['/products', p.id]" class="as-icon-btn-sm" title="View">
                      <mat-icon>visibility</mat-icon>
                    </a>
                    @if (authService.isManagerUp()) {
                      <a [routerLink]="['/products', p.id, 'edit']" class="as-icon-btn-sm" title="Edit">
                        <mat-icon>edit</mat-icon>
                      </a>
                    }
                    @if (authService.isAdmin()) {
                      <button class="as-icon-btn-sm as-icon-btn-sm--danger" (click)="deleteProduct(p.id)" title="Delete">
                        <mat-icon>delete</mat-icon>
                      </button>
                    }
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </main>
  `,
  styles: [`
    .as-main { padding: 24px; max-width: 1280px; margin: 0 auto; }
    .as-loading { display: flex; justify-content: center; padding: 64px; }

    .as-page-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 20px; }
    .as-page-title { font-size: 22px; font-weight: 600; color: var(--as-ink-text); margin: 0; letter-spacing: -0.01em; }
    .as-page-subtitle { font-size: 13px; color: var(--as-ink-muted); margin: 4px 0 0; }
    .as-page-actions { display: flex; gap: 10px; }

    .as-btn {
      display: inline-flex; align-items: center; gap: 6px; padding: 9px 16px;
      border-radius: 6px; font-size: 13px; font-weight: 600; text-decoration: none;
      cursor: pointer; border: none; transition: background 0.15s;
    }
    .as-btn mat-icon { font-size: 18px; height: 18px; width: 18px; }
    .as-btn--ghost { background: white; border: 1px solid var(--as-border); color: var(--as-ink-text); }
    .as-btn--ghost:hover { background: var(--as-paper-dim); }
    .as-btn--primary { background: var(--as-ink-900); color: white; }
    .as-btn--primary:hover { background: var(--as-ink-800); }

    .as-empty-state { display: flex; flex-direction: column; align-items: center; gap: 10px; padding: 56px; color: var(--as-ink-muted); }
    .as-empty-state mat-icon { font-size: 36px; height: 36px; width: 36px; opacity: 0.4; }

    .as-table { width: 100%; border-collapse: collapse; }
    .as-table thead th {
      text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em;
      color: var(--as-ink-muted); font-weight: 600; padding: 12px 16px; border-bottom: 1px solid var(--as-border);
      background: var(--as-paper-dim);
    }
    .as-table tbody td { padding: 12px 16px; font-size: 13px; border-bottom: 1px solid var(--as-border); }
    .as-table tbody tr:last-child td { border-bottom: none; }
    .as-table tbody tr:hover { background: var(--as-paper-dim); }
    .as-table__right { text-align: right; }
    .as-table__muted { color: var(--as-ink-muted); }
    .as-table__sku { color: var(--as-ink-muted); }
    .as-table__actions { display: flex; gap: 4px; justify-content: flex-end; }

    .as-icon-btn-sm {
      display: flex; align-items: center; justify-content: center; width: 30px; height: 30px;
      border-radius: 6px; border: none; background: transparent; color: var(--as-ink-muted);
      cursor: pointer; text-decoration: none;
    }
    .as-icon-btn-sm:hover { background: var(--as-paper-dim); color: var(--as-ink-text); }
    .as-icon-btn-sm--danger:hover { background: var(--as-critical-bg); color: var(--as-critical); }
    .as-icon-btn-sm mat-icon { font-size: 18px; height: 18px; width: 18px; }
  `]
})
export class ProductListComponent implements OnInit {
  private readonly productsService = inject(ProductsService);
  private readonly reportsService = inject(ReportsService);
  private readonly notification = inject(NotificationService);
  readonly authService = inject(AuthService);

  readonly products = signal<Product[]>([]);
  readonly loading = signal(true);

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.loading.set(true);
    this.productsService.getAll().subscribe({
      next: (products) => { this.products.set(products); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  deleteProduct(id: string): void {
    if (!confirm('Are you sure you want to delete this product?')) return;
    this.productsService.delete(id).subscribe({ next: () => this.loadProducts() });
  }

  exportExcel(): void {
    this.reportsService.exportProductsExcel().subscribe({
      next: (blob) => this.reportsService.downloadFile(blob, `products-${Date.now()}.xlsx`),
      error: () => this.notification.error('Failed to export Excel.')
    });
  }

  exportPdf(): void {
    this.reportsService.exportProductsPdf().subscribe({
      next: (blob) => this.reportsService.downloadFile(blob, `products-${Date.now()}.pdf`),
      error: () => this.notification.error('Failed to export PDF.')
    });
  }
}
