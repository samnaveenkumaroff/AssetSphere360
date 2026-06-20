import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { AppShellComponent } from '../../shared/components/app-shell.component';
import { StockMovementsService } from '../../core/services/stock-movements.service';
import { ProductsService } from '../../core/services/products.service';
import { WarehousesService } from '../../core/services/warehouses.service';
import { ReportsService } from '../../core/services/reports.service';
import { NotificationService } from '../../core/services/notification.service';
import { StockMovement, MovementType, Warehouse } from '../../core/models/stock-movement.model';
import { Product } from '../../core/models/product.model';

const MOVEMENT_TYPES: MovementType[] = ['StockIn', 'StockOut', 'Adjustment', 'Transfer', 'Return'];

@Component({
  selector: 'app-stock-movement-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule, AppShellComponent],
  template: `
    <app-shell></app-shell>

    <main class="as-main">
      <div class="as-page-header">
        <div>
          <h1 class="as-page-title">Stock Movements</h1>
          <p class="as-page-subtitle">{{ movements().length }} movements recorded</p>
        </div>
        <button class="as-btn as-btn--ghost" (click)="exportExcel()">
          <mat-icon>file_download</mat-icon> Export Excel
        </button>
      </div>

      <div class="as-card as-form-card">
        <div class="as-form-card__title">Record Movement</div>
        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <div class="as-form-row">
            <div class="as-field as-field--grow-2">
              <label class="as-label">Product</label>
              <select class="as-input" formControlName="productId">
                <option value="" disabled>Select product</option>
                @for (p of products(); track p.id) {
                  <option [value]="p.id">{{ p.name }} ({{ p.sku }})</option>
                }
              </select>
            </div>
            <div class="as-field as-field--grow">
              <label class="as-label">Warehouse</label>
              <select class="as-input" formControlName="warehouseId">
                <option value="" disabled>Select warehouse</option>
                @for (w of warehouses(); track w.id) {
                  <option [value]="w.id">{{ w.name }}</option>
                }
              </select>
            </div>
            <div class="as-field as-field--grow">
              <label class="as-label">Type</label>
              <select class="as-input" formControlName="movementType">
                @for (t of movementTypes; track t) {
                  <option [value]="t">{{ t }}</option>
                }
              </select>
            </div>
          </div>
          <div class="as-form-row">
            <div class="as-field as-field--grow">
              <label class="as-label">Quantity</label>
              <input class="as-input as-mono" type="number" formControlName="quantity" min="0.01" step="0.01" />
            </div>
            <div class="as-field as-field--grow">
              <label class="as-label">Unit Cost (₹)</label>
              <input class="as-input as-mono" type="number" formControlName="unitCost" min="0" step="0.01" />
            </div>
            <div class="as-field as-field--grow">
              <label class="as-label">Reference #</label>
              <input class="as-input" formControlName="referenceNumber" placeholder="Optional" />
            </div>
          </div>
          <button class="as-btn as-btn--primary" type="submit" [disabled]="form.invalid || saving()">
            {{ saving() ? 'Recording…' : 'Record Movement' }}
          </button>
        </form>
      </div>

      @if (loading()) {
        <div class="as-loading">Loading...</div>
      } @else if (movements().length === 0) {
        <div class="as-card as-empty-state">
          <mat-icon>swap_horiz</mat-icon>
          <p>No stock movements recorded yet.</p>
        </div>
      } @else {
        <div class="as-card">
          <table class="as-table">
            <thead>
              <tr><th>Date</th><th>Product</th><th>Warehouse</th><th>Type</th><th class="as-table__right">Qty</th><th>Reference</th></tr>
            </thead>
            <tbody>
              @for (m of movements(); track m.id) {
                <tr>
                  <td class="as-table__muted">{{ m.movementDate | date:'MMM d, h:mm a' }}</td>
                  <td>{{ m.productName }} <span class="as-mono as-table__muted">({{ m.productSku }})</span></td>
                  <td class="as-table__muted">{{ m.warehouseName }}</td>
                  <td><span class="as-type-chip" [class]="'as-type-chip--' + m.movementType.toLowerCase()">{{ m.movementType }}</span></td>
                  <td class="as-mono as-table__right">{{ m.quantity }}</td>
                  <td class="as-table__muted">{{ m.referenceNumber || '—' }}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </main>
  `,
  styles: [`
    .as-main { padding: 24px; max-width: 1200px; margin: 0 auto; }
    .as-loading { padding: 48px; text-align: center; color: var(--as-ink-muted); }
    .as-page-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 20px; }
    .as-page-title { font-size: 22px; font-weight: 600; color: var(--as-ink-text); margin: 0; letter-spacing: -0.01em; }
    .as-page-subtitle { font-size: 13px; color: var(--as-ink-muted); margin: 4px 0 0; }

    .as-form-card { padding: 18px; margin-bottom: 16px; }
    .as-form-card__title { font-size: 13px; font-weight: 600; color: var(--as-ink-text); margin-bottom: 14px; }
    .as-form-row { display: flex; gap: 12px; margin-bottom: 12px; }
    .as-field { display: flex; flex-direction: column; gap: 4px; }
    .as-field--grow { flex: 1; }
    .as-field--grow-2 { flex: 2; }
    .as-label { font-size: 11px; font-weight: 600; color: var(--as-ink-muted); text-transform: uppercase; letter-spacing: 0.04em; }
    .as-input {
      border: 1px solid var(--as-border); border-radius: 6px; padding: 9px 12px; font-size: 13px;
      font-family: inherit; background: var(--as-paper); color: var(--as-ink-text);
    }
    .as-input:focus { outline: 2px solid var(--as-ink-900); outline-offset: -1px; border-color: var(--as-ink-900); }

    .as-btn {
      display: inline-flex; align-items: center; gap: 6px; padding: 9px 16px;
      border-radius: 6px; font-size: 13px; font-weight: 600; border: none; cursor: pointer;
    }
    .as-btn mat-icon { font-size: 18px; height: 18px; width: 18px; }
    .as-btn--primary { background: var(--as-ink-900); color: white; }
    .as-btn--primary:hover { background: var(--as-ink-800); }
    .as-btn--ghost { background: white; border: 1px solid var(--as-border); color: var(--as-ink-text); }
    .as-btn--ghost:hover { background: var(--as-paper-dim); }
    .as-btn:disabled { opacity: 0.5; cursor: not-allowed; }

    .as-empty-state { display: flex; flex-direction: column; align-items: center; gap: 10px; padding: 48px; color: var(--as-ink-muted); }
    .as-empty-state mat-icon { font-size: 32px; height: 32px; width: 32px; opacity: 0.4; }

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

    .as-type-chip {
      font-size: 11px; font-weight: 600; padding: 3px 9px; border-radius: 100px;
      text-transform: uppercase; letter-spacing: 0.03em;
    }
    .as-type-chip--stockin { background: var(--as-stock-in-bg); color: var(--as-stock-in); }
    .as-type-chip--stockout { background: var(--as-stock-out-bg); color: var(--as-stock-out); }
    .as-type-chip--adjustment { background: var(--as-adjustment-bg); color: var(--as-adjustment); }
    .as-type-chip--transfer { background: var(--as-transfer-bg); color: var(--as-transfer); }
    .as-type-chip--return { background: var(--as-return-bg); color: var(--as-return); }
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
      productId: value.productId!, warehouseId: value.warehouseId!, movementType: value.movementType!,
      quantity: value.quantity!, unitCost: value.unitCost!, referenceNumber: value.referenceNumber || undefined
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
