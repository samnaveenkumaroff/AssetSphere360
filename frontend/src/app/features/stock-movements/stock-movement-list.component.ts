import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { StockMovementsService } from '../../core/services/stock-movements.service';
import { ProductsService } from '../../core/services/products.service';
import { WarehousesService } from '../../core/services/warehouses.service';
import { ReportsService } from '../../core/services/reports.service';
import { NotificationService } from '../../core/services/notification.service';
import { StockMovement, MovementType } from '../../core/models/stock-movement.model';
import { Product } from '../../core/models/product.model';
import { Warehouse } from '../../core/models/stock-movement.model';

const MOVEMENT_TYPES: MovementType[] = ['StockIn', 'StockOut', 'Adjustment', 'Transfer', 'Return'];

@Component({
  selector: 'app-stock-movement-list',
  standalone: true,
  imports: [
    CommonModule, RouterLink, ReactiveFormsModule, MatToolbarModule, MatIconModule,
    MatCardModule, MatTableModule, MatButtonModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, MatChipsModule
  ],
  template: `
    <mat-toolbar color="primary">
      <button mat-icon-button routerLink="/dashboard"><mat-icon>arrow_back</mat-icon></button>
      <span>Stock Movements</span>
      <span class="spacer"></span>
      <button mat-button (click)="exportExcel()">
        <mat-icon>file_download</mat-icon> Export Excel
      </button>
    </mat-toolbar>

    <div class="page-container">
      <mat-card class="form-card">
        <mat-card-header><mat-card-title>Record Stock Movement</mat-card-title></mat-card-header>
        <mat-card-content>
          <form [formGroup]="form" (ngSubmit)="onSubmit()">
            <div class="form-row">
              <mat-form-field appearance="outline" class="flex-2">
                <mat-label>Product</mat-label>
                <mat-select formControlName="productId">
                  @for (p of products(); track p.id) {
                    <mat-option [value]="p.id">{{ p.name }} ({{ p.sku }})</mat-option>
                  }
                </mat-select>
              </mat-form-field>
              <mat-form-field appearance="outline" class="flex-1">
                <mat-label>Warehouse</mat-label>
                <mat-select formControlName="warehouseId">
                  @for (w of warehouses(); track w.id) {
                    <mat-option [value]="w.id">{{ w.name }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>
              <mat-form-field appearance="outline" class="flex-1">
                <mat-label>Type</mat-label>
                <mat-select formControlName="movementType">
                  @for (t of movementTypes; track t) {
                    <mat-option [value]="t">{{ t }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>
            </div>
            <div class="form-row">
              <mat-form-field appearance="outline" class="flex-1">
                <mat-label>Quantity</mat-label>
                <input matInput type="number" formControlName="quantity" min="0.01" step="0.01" />
              </mat-form-field>
              <mat-form-field appearance="outline" class="flex-1">
                <mat-label>Unit Cost (₹)</mat-label>
                <input matInput type="number" formControlName="unitCost" min="0" step="0.01" />
              </mat-form-field>
              <mat-form-field appearance="outline" class="flex-1">
                <mat-label>Reference # (optional)</mat-label>
                <input matInput formControlName="referenceNumber" />
              </mat-form-field>
            </div>
            <button mat-flat-button color="primary" type="submit" [disabled]="form.invalid || saving()">
              {{ saving() ? 'Recording...' : 'Record Movement' }}
            </button>
          </form>
        </mat-card-content>
      </mat-card>

      @if (loading()) {
        <p class="empty-state">Loading...</p>
      } @else if (movements().length === 0) {
        <p class="empty-state">No stock movements recorded yet.</p>
      } @else {
        <table mat-table [dataSource]="movements()" class="full-width-table">
          <ng-container matColumnDef="date">
            <th mat-header-cell *matHeaderCellDef>Date</th>
            <td mat-cell *matCellDef="let m">{{ m.movementDate | date:'short' }}</td>
          </ng-container>
          <ng-container matColumnDef="product">
            <th mat-header-cell *matHeaderCellDef>Product</th>
            <td mat-cell *matCellDef="let m">{{ m.productName }} ({{ m.productSku }})</td>
          </ng-container>
          <ng-container matColumnDef="warehouse">
            <th mat-header-cell *matHeaderCellDef>Warehouse</th>
            <td mat-cell *matCellDef="let m">{{ m.warehouseName }}</td>
          </ng-container>
          <ng-container matColumnDef="type">
            <th mat-header-cell *matHeaderCellDef>Type</th>
            <td mat-cell *matCellDef="let m">
              <mat-chip [color]="m.movementType === 'StockOut' ? 'warn' : 'primary'" highlighted>
                {{ m.movementType }}
              </mat-chip>
            </td>
          </ng-container>
          <ng-container matColumnDef="quantity">
            <th mat-header-cell *matHeaderCellDef>Quantity</th>
            <td mat-cell *matCellDef="let m">{{ m.quantity }}</td>
          </ng-container>
          <ng-container matColumnDef="reference">
            <th mat-header-cell *matHeaderCellDef>Reference</th>
            <td mat-cell *matCellDef="let m">{{ m.referenceNumber || '—' }}</td>
          </ng-container>
          <tr mat-header-row *matHeaderRowDef="columns"></tr>
          <tr mat-row *matRowDef="let row; columns: columns;"></tr>
        </table>
      }
    </div>
  `,
  styles: [`
    .spacer { flex: 1 1 auto; }
    .page-container { padding: 24px; max-width: 1100px; margin: 0 auto; }
    .form-card { margin-bottom: 16px; }
    .form-row { display: flex; gap: 16px; }
    .flex-1 { flex: 1; }
    .flex-2 { flex: 2; }
    .full-width-table { width: 100%; }
    .empty-state { text-align: center; color: #666; padding: 32px; }
  `]
})
export class StockMovementListComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly stockMovementsService = inject(StockMovementsService);
  private readonly productsService = inject(ProductsService);
  private readonly warehousesService = inject(WarehousesService);
  private readonly reportsService = inject(ReportsService);
  private readonly notification = inject(NotificationService);

  readonly movements = signal<StockMovement[]>([]);
  readonly products = signal<Product[]>([]);
  readonly warehouses = signal<Warehouse[]>([]);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly movementTypes = MOVEMENT_TYPES;
  readonly columns = ['date', 'product', 'warehouse', 'type', 'quantity', 'reference'];

  readonly form = this.fb.group({
    productId: ['', [Validators.required]],
    warehouseId: ['', [Validators.required]],
    movementType: ['StockIn' as MovementType, [Validators.required]],
    quantity: [0, [Validators.required, Validators.min(0.01)]],
    unitCost: [0, [Validators.required, Validators.min(0)]],
    referenceNumber: ['']
  });

  ngOnInit(): void {
    this.loadMovements();
    this.productsService.getAll().subscribe(p => this.products.set(p));
    this.warehousesService.getAll().subscribe(w => this.warehouses.set(w));
  }

  loadMovements(): void {
    this.loading.set(true);
    this.stockMovementsService.getAll().subscribe({
      next: (m) => { this.movements.set(m); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.saving.set(true);
    const value = this.form.getRawValue();
    this.stockMovementsService.create({
      productId: value.productId!,
      warehouseId: value.warehouseId!,
      movementType: value.movementType!,
      quantity: value.quantity!,
      unitCost: value.unitCost!,
      referenceNumber: value.referenceNumber || undefined
    }).subscribe({
      next: () => {
        this.saving.set(false);
        this.form.reset({ movementType: 'StockIn', quantity: 0, unitCost: 0 });
        this.notification.success('Stock movement recorded.');
        this.loadMovements();
      },
      error: (err) => {
        this.saving.set(false);
        this.notification.error(err.error?.message ?? 'Failed to record movement.');
      }
    });
  }

  exportExcel(): void {
    this.reportsService.exportStockMovementsExcel().subscribe({
      next: (blob) => this.reportsService.downloadFile(blob, `stock-movements-${Date.now()}.xlsx`),
      error: () => this.notification.error('Failed to export.')
    });
  }
}
