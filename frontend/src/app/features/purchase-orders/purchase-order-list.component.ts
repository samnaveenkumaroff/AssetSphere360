import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormArray, FormGroup, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { AppShellComponent } from '../../shared/components/app-shell.component';
import { OrderStatusBadgeComponent } from '../../shared/components/order-status-badge.component';
import { PurchaseOrdersService } from '../../core/services/purchase-orders.service';
import { SuppliersService } from '../../core/services/suppliers.service';
import { WarehousesService } from '../../core/services/warehouses.service';
import { ProductsService } from '../../core/services/products.service';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { PurchaseOrder } from '../../core/models/purchase-order.model';
import { Supplier } from '../../core/models/supplier.model';
import { Warehouse } from '../../core/models/stock-movement.model';
import { Product } from '../../core/models/product.model';

@Component({
  selector: 'app-purchase-order-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule, AppShellComponent, OrderStatusBadgeComponent],
  template: `
    <app-shell></app-shell>

    <main class="as-main">
      <div class="as-page-header">
        <div>
          <h1 class="as-page-title">Purchase Orders</h1>
          <p class="as-page-subtitle">{{ orders().length }} orders</p>
        </div>
        @if (authService.isManagerUp()) {
          <button class="as-btn as-btn--primary" (click)="showForm.set(!showForm())">
            <mat-icon>{{ showForm() ? 'close' : 'add' }}</mat-icon>
            {{ showForm() ? 'Cancel' : 'New Purchase Order' }}
          </button>
        }
      </div>

      @if (showForm()) {
        <div class="as-card as-form-card">
          <div class="as-form-card__title">New Purchase Order</div>
          <form [formGroup]="form" (ngSubmit)="onSubmit()">
            <div class="as-form-row">
              <div class="as-field as-field--grow">
                <label class="as-label">Supplier</label>
                <select class="as-input" formControlName="supplierId">
                  <option value="" disabled>Select supplier</option>
                  @for (s of suppliers(); track s.id) {
                    <option [value]="s.id">{{ s.name }}</option>
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
            </div>

            <div class="as-lines-header">
              <span>Line Items</span>
              <button type="button" class="as-btn as-btn--ghost as-btn--sm" (click)="addLine()">
                <mat-icon>add</mat-icon> Add Line
              </button>
            </div>

            <div formArrayName="lines">
              @for (line of lines.controls; track $index) {
                <div [formGroupName]="$index" class="as-line-row">
                  <select class="as-input as-line-row__product" [formControlName]="'productId'">
                    <option value="" disabled>Select product</option>
                    @for (p of products(); track p.id) {
                      <option [value]="p.id">{{ p.name }} ({{ p.sku }})</option>
                    }
                  </select>
                  <input class="as-input as-mono as-line-row__qty" type="number" placeholder="Qty" formControlName="quantity" min="0.01" step="0.01" />
                  <input class="as-input as-mono as-line-row__cost" type="number" placeholder="Unit Cost" formControlName="unitCost" min="0" step="0.01" />
                  <button type="button" class="as-icon-btn-sm as-icon-btn-sm--danger" (click)="removeLine($index)">
                    <mat-icon>delete</mat-icon>
                  </button>
                </div>
              }
            </div>

            <button class="as-btn as-btn--primary" type="submit" [disabled]="form.invalid || lines.length === 0 || saving()">
              {{ saving() ? 'Creating…' : 'Create Purchase Order' }}
            </button>
          </form>
        </div>
      }

      @if (loading()) {
        <div class="as-loading">Loading...</div>
      } @else if (orders().length === 0) {
        <div class="as-card as-empty-state">
          <mat-icon>shopping_cart</mat-icon>
          <p>No purchase orders yet.</p>
        </div>
      } @else {
        <div class="as-card">
          <table class="as-table">
            <thead>
              <tr><th>Order #</th><th>Supplier</th><th>Status</th><th class="as-table__right">Total</th><th class="as-table__right">Actions</th></tr>
            </thead>
            <tbody>
              @for (o of orders(); track o.id) {
                <tr>
                  <td class="as-mono">{{ o.orderNumber }}</td>
                  <td>{{ o.supplierName }}</td>
                  <td><app-order-status-badge [status]="o.status" /></td>
                  <td class="as-mono as-table__right">{{ o.currency }} {{ o.totalAmount | number:'1.2-2' }}</td>
                  <td class="as-table__right as-table__actions">
                    @if (o.status === 'Draft' && authService.isManagerUp()) {
                      <button class="as-action-btn" (click)="submit(o.id)">Submit</button>
                    }
                    @if (o.status === 'Submitted' && authService.isManagerUp()) {
                      <button class="as-action-btn" (click)="approve(o.id)">Approve</button>
                    }
                    @if (o.status === 'Approved' && authService.isManagerUp()) {
                      <button class="as-action-btn as-action-btn--primary" (click)="receive(o.id)">Receive</button>
                    }
                    @if (o.status !== 'Delivered' && o.status !== 'Cancelled' && authService.isManagerUp()) {
                      <button class="as-action-btn as-action-btn--danger" (click)="cancel(o.id)">Cancel</button>
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
    .as-main { padding: 24px; max-width: 1200px; margin: 0 auto; }
    .as-loading { padding: 48px; text-align: center; color: var(--as-ink-muted); }
    .as-page-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 20px; }
    .as-page-title { font-size: 22px; font-weight: 600; color: var(--as-ink-text); margin: 0; letter-spacing: -0.01em; }
    .as-page-subtitle { font-size: 13px; color: var(--as-ink-muted); margin: 4px 0 0; }

    .as-form-card { padding: 18px; margin-bottom: 16px; }
    .as-form-card__title { font-size: 13px; font-weight: 600; color: var(--as-ink-text); margin-bottom: 14px; }
    .as-form-row { display: flex; gap: 12px; margin-bottom: 16px; }
    .as-field { display: flex; flex-direction: column; gap: 4px; }
    .as-field--grow { flex: 1; }
    .as-label { font-size: 11px; font-weight: 600; color: var(--as-ink-muted); text-transform: uppercase; letter-spacing: 0.04em; }
    .as-input {
      border: 1px solid var(--as-border); border-radius: 6px; padding: 9px 12px; font-size: 13px;
      font-family: inherit; background: var(--as-paper); color: var(--as-ink-text);
    }
    .as-input:focus { outline: 2px solid var(--as-ink-900); outline-offset: -1px; border-color: var(--as-ink-900); }

    .as-lines-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; font-size: 12px; font-weight: 600; color: var(--as-ink-muted); text-transform: uppercase; letter-spacing: 0.04em; }
    .as-line-row { display: flex; gap: 8px; margin-bottom: 8px; align-items: center; }
    .as-line-row__product { flex: 2; }
    .as-line-row__qty { flex: 1; }
    .as-line-row__cost { flex: 1; }

    .as-btn {
      display: inline-flex; align-items: center; gap: 6px; padding: 9px 16px;
      border-radius: 6px; font-size: 13px; font-weight: 600; border: none; cursor: pointer;
    }
    .as-btn--sm { padding: 6px 12px; font-size: 12px; }
    .as-btn mat-icon { font-size: 18px; height: 18px; width: 18px; }
    .as-btn--primary { background: var(--as-ink-900); color: white; margin-top: 12px; }
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
    .as-table__actions { display: flex; gap: 6px; justify-content: flex-end; }

    .as-action-btn {
      font-size: 11px; font-weight: 600; padding: 5px 10px; border-radius: 6px;
      border: 1px solid var(--as-border); background: white; color: var(--as-ink-text); cursor: pointer;
    }
    .as-action-btn:hover { background: var(--as-paper-dim); }
    .as-action-btn--primary { background: var(--as-ink-900); color: white; border-color: var(--as-ink-900); }
    .as-action-btn--danger { color: var(--as-critical); border-color: var(--as-critical-bg); }
    .as-action-btn--danger:hover { background: var(--as-critical-bg); }

    .as-icon-btn-sm {
      display: flex; align-items: center; justify-content: center; width: 32px; height: 32px;
      border-radius: 6px; border: none; background: transparent; color: var(--as-ink-muted); cursor: pointer; flex-shrink: 0;
    }
    .as-icon-btn-sm--danger:hover { background: var(--as-critical-bg); color: var(--as-critical); }
    .as-icon-btn-sm mat-icon { font-size: 18px; height: 18px; width: 18px; }
  `]
})
export class PurchaseOrderListComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly poService = inject(PurchaseOrdersService);
  private readonly suppliersService = inject(SuppliersService);
  private readonly warehousesService = inject(WarehousesService);
  private readonly productsService = inject(ProductsService);
  private readonly notification = inject(NotificationService);
  readonly authService = inject(AuthService);

  readonly orders = signal<PurchaseOrder[]>([]);
  readonly suppliers = signal<Supplier[]>([]);
  readonly warehouses = signal<Warehouse[]>([]);
  readonly products = signal<Product[]>([]);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly showForm = signal(false);

  readonly form = this.fb.group({
    supplierId: ['', [Validators.required]],
    warehouseId: ['', [Validators.required]],
    lines: this.fb.array([])
  });

  get lines(): FormArray { return this.form.get('lines') as FormArray; }

  ngOnInit(): void {
    this.loadOrders();
    this.suppliersService.getAll().subscribe(s => this.suppliers.set(s));
    this.warehousesService.getAll().subscribe(w => this.warehouses.set(w));
    this.productsService.getAll().subscribe(p => this.products.set(p));
    this.addLine();
  }

  loadOrders(): void {
    this.loading.set(true);
    this.poService.getAll().subscribe({
      next: (o) => { this.orders.set(o); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  addLine(): void {
    this.lines.push(this.fb.group({
      productId: ['', [Validators.required]],
      quantity: [1, [Validators.required, Validators.min(0.01)]],
      unitCost: [0, [Validators.required, Validators.min(0)]]
    }));
  }

  removeLine(index: number): void {
    this.lines.removeAt(index);
  }

  onSubmit(): void {
    if (this.form.invalid || this.lines.length === 0) return;
    this.saving.set(true);
    const value = this.form.getRawValue();
    this.poService.create({
      supplierId: value.supplierId!,
      warehouseId: value.warehouseId!,
      lines: value.lines as any
    }).subscribe({
      next: () => {
        this.saving.set(false);
        this.showForm.set(false);
        this.form.reset();
        this.lines.clear();
        this.addLine();
        this.notification.success('Purchase order created.');
        this.loadOrders();
      },
      error: (err) => {
        this.saving.set(false);
        this.notification.error(err.error?.message ?? 'Failed to create purchase order.');
      }
    });
  }

  submit(id: string): void {
    this.poService.submit(id).subscribe({
      next: () => { this.notification.success('Order submitted.'); this.loadOrders(); },
      error: (err) => this.notification.error(err.error?.message ?? 'Failed to submit.')
    });
  }

  approve(id: string): void {
    this.poService.approve(id).subscribe({
      next: () => { this.notification.success('Order approved.'); this.loadOrders(); },
      error: (err) => this.notification.error(err.error?.message ?? 'Failed to approve.')
    });
  }

  receive(id: string): void {
    this.poService.receive(id).subscribe({
      next: () => { this.notification.success('Order received — stock updated.'); this.loadOrders(); },
      error: (err) => this.notification.error(err.error?.message ?? 'Failed to receive.')
    });
  }

  cancel(id: string): void {
    if (!confirm('Cancel this purchase order?')) return;
    this.poService.cancel(id).subscribe({
      next: () => { this.notification.success('Order cancelled.'); this.loadOrders(); },
      error: (err) => this.notification.error(err.error?.message ?? 'Failed to cancel.')
    });
  }
}
