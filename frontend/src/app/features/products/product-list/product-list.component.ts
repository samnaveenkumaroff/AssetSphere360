import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { ProductsService } from '../../../core/services/products.service';
import { AuthService } from '../../../core/services/auth.service';
import { ReportsService } from '../../../core/services/reports.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Product } from '../../../core/models/product.model';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [
    CommonModule, RouterLink, MatTableModule, MatButtonModule,
    MatIconModule, MatChipsModule, MatProgressSpinnerModule,
    MatToolbarModule, MatTooltipModule, MatMenuModule
  ],
  template: `
    <mat-toolbar color="primary">
      <button mat-icon-button routerLink="/dashboard"><mat-icon>arrow_back</mat-icon></button>
      <span>AssetSphere 360 — Inventory</span>
      <span class="spacer"></span>
      <span class="user-name">{{ authService.currentUser()?.fullName }}</span>
      <button mat-icon-button (click)="authService.logout()" matTooltip="Logout">
        <mat-icon>logout</mat-icon>
      </button>
    </mat-toolbar>

    <div class="page-container">
      <div class="page-header">
        <h2>Products</h2>
        <div class="header-actions">
          <button mat-button [matMenuTriggerFor]="exportMenu">
            <mat-icon>file_download</mat-icon> Export
          </button>
          <mat-menu #exportMenu="matMenu">
            <button mat-menu-item (click)="exportExcel()">Excel (.xlsx)</button>
            <button mat-menu-item (click)="exportPdf()">PDF</button>
          </mat-menu>
          @if (authService.isManagerUp()) {
            <button mat-flat-button color="primary" routerLink="/products/new">
              <mat-icon>add</mat-icon> New Product
            </button>
          }
        </div>
      </div>

      @if (loading()) {
        <div class="spinner-container"><mat-spinner /></div>
      } @else if (products().length === 0) {
        <p class="empty-state">No products yet. Create your first one to get started.</p>
      } @else {
        <table mat-table [dataSource]="products()" class="full-width-table">
          <ng-container matColumnDef="sku">
            <th mat-header-cell *matHeaderCellDef>SKU</th>
            <td mat-cell *matCellDef="let p">{{ p.sku }}</td>
          </ng-container>

          <ng-container matColumnDef="name">
            <th mat-header-cell *matHeaderCellDef>Name</th>
            <td mat-cell *matCellDef="let p">{{ p.name }}</td>
          </ng-container>

          <ng-container matColumnDef="category">
            <th mat-header-cell *matHeaderCellDef>Category</th>
            <td mat-cell *matCellDef="let p">{{ p.categoryName }}</td>
          </ng-container>

          <ng-container matColumnDef="stock">
            <th mat-header-cell *matHeaderCellDef>Stock</th>
            <td mat-cell *matCellDef="let p">
              {{ p.currentStock }} {{ p.unit }}
              @if (p.isLowStock) {
                <mat-chip color="warn" highlighted>Low Stock</mat-chip>
              }
            </td>
          </ng-container>

          <ng-container matColumnDef="price">
            <th mat-header-cell *matHeaderCellDef>Selling Price</th>
            <td mat-cell *matCellDef="let p">{{ p.sellingCurrency }} {{ p.sellingAmount | number:'1.2-2' }}</td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef>Actions</th>
            <td mat-cell *matCellDef="let p">
              <button mat-icon-button [routerLink]="['/products', p.id]">
                <mat-icon>visibility</mat-icon>
              </button>
              @if (authService.isManagerUp()) {
                <button mat-icon-button [routerLink]="['/products', p.id, 'edit']">
                  <mat-icon>edit</mat-icon>
                </button>
              }
              @if (authService.isAdmin()) {
                <button mat-icon-button color="warn" (click)="deleteProduct(p.id)">
                  <mat-icon>delete</mat-icon>
                </button>
              }
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="columns"></tr>
          <tr mat-row *matRowDef="let row; columns: columns;"></tr>
        </table>
      }
    </div>
  `,
  styles: [`
    .spacer { flex: 1 1 auto; }
    .user-name { margin-right: 12px; font-size: 14px; }
    .page-container { padding: 24px; max-width: 1200px; margin: 0 auto; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .header-actions { display: flex; gap: 8px; align-items: center; }
    .full-width-table { width: 100%; }
    .spinner-container { display: flex; justify-content: center; padding: 48px; }
    .empty-state { text-align: center; color: #666; padding: 48px; }
    mat-chip { margin-left: 8px; font-size: 11px; min-height: 24px; }
  `]
})
export class ProductListComponent implements OnInit {
  private readonly productsService = inject(ProductsService);
  private readonly reportsService = inject(ReportsService);
  private readonly notification = inject(NotificationService);
  readonly authService = inject(AuthService);

  readonly products = signal<Product[]>([]);
  readonly loading = signal(true);
  readonly columns = ['sku', 'name', 'category', 'stock', 'price', 'actions'];

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.loading.set(true);
    this.productsService.getAll().subscribe({
      next: (products) => {
        this.products.set(products);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  deleteProduct(id: string): void {
    if (!confirm('Are you sure you want to delete this product?')) return;
    this.productsService.delete(id).subscribe({
      next: () => this.loadProducts()
    });
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
