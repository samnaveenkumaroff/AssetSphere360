import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { AppShellComponent } from '../../shared/components/app-shell.component';
import { SuppliersService } from '../../core/services/suppliers.service';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { Supplier } from '../../core/models/supplier.model';

@Component({
  selector: 'app-supplier-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule, AppShellComponent],
  template: `
    <app-shell></app-shell>

    <main class="as-main">
      <div class="as-page-header">
        <div>
          <h1 class="as-page-title">Suppliers</h1>
          <p class="as-page-subtitle">{{ suppliers().length }} suppliers on file</p>
        </div>
      </div>

      <div class="as-card as-form-card">
        <div class="as-form-card__title">New Supplier</div>
        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <div class="as-form-row">
            <div class="as-field as-field--grow">
              <label class="as-label">Company Name</label>
              <input class="as-input" formControlName="name" />
            </div>
            <div class="as-field as-field--grow">
              <label class="as-label">Contact Person</label>
              <input class="as-input" formControlName="contactPerson" />
            </div>
          </div>
          <div class="as-form-row">
            <div class="as-field as-field--grow">
              <label class="as-label">Email</label>
              <input class="as-input" type="email" formControlName="email" />
            </div>
            <div class="as-field as-field--grow">
              <label class="as-label">Phone</label>
              <input class="as-input" formControlName="phone" />
            </div>
            <div class="as-field as-field--grow">
              <label class="as-label">GST Number</label>
              <input class="as-input" formControlName="gstNumber" placeholder="Optional" />
            </div>
          </div>
          <button class="as-btn as-btn--primary" type="submit" [disabled]="form.invalid || saving()">
            <mat-icon>add</mat-icon> Add Supplier
          </button>
        </form>
      </div>

      @if (loading()) {
        <div class="as-loading">Loading...</div>
      } @else if (suppliers().length === 0) {
        <div class="as-card as-empty-state">
          <mat-icon>local_shipping</mat-icon>
          <p>No suppliers yet. Add one above.</p>
        </div>
      } @else {
        <div class="as-card">
          <table class="as-table">
            <thead>
              <tr><th>Name</th><th>Contact</th><th>Phone</th><th class="as-table__right">Products</th><th class="as-table__right">Actions</th></tr>
            </thead>
            <tbody>
              @for (s of suppliers(); track s.id) {
                <tr>
                  <td>{{ s.name }}</td>
                  <td class="as-table__muted">{{ s.contactPerson }} — {{ s.email }}</td>
                  <td class="as-mono">{{ s.phone }}</td>
                  <td class="as-mono as-table__right">{{ s.productCount }}</td>
                  <td class="as-table__right">
                    @if (authService.isAdmin() && s.productCount === 0) {
                      <button class="as-icon-btn-sm as-icon-btn-sm--danger" (click)="deleteSupplier(s.id)" title="Delete">
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
    .as-main { padding: 24px; max-width: 1000px; margin: 0 auto; }
    .as-loading { padding: 48px; text-align: center; color: var(--as-ink-muted); }
    .as-page-header { margin-bottom: 20px; }
    .as-page-title { font-size: 22px; font-weight: 600; color: var(--as-ink-text); margin: 0; letter-spacing: -0.01em; }
    .as-page-subtitle { font-size: 13px; color: var(--as-ink-muted); margin: 4px 0 0; }

    .as-form-card { padding: 18px; margin-bottom: 16px; }
    .as-form-card__title { font-size: 13px; font-weight: 600; color: var(--as-ink-text); margin-bottom: 14px; }
    .as-form-row { display: flex; gap: 12px; margin-bottom: 12px; }
    .as-field { display: flex; flex-direction: column; gap: 4px; }
    .as-field--grow { flex: 1; }
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

    .as-icon-btn-sm {
      display: flex; align-items: center; justify-content: center; width: 30px; height: 30px;
      border-radius: 6px; border: none; background: transparent; color: var(--as-ink-muted); cursor: pointer;
    }
    .as-icon-btn-sm--danger:hover { background: var(--as-critical-bg); color: var(--as-critical); }
    .as-icon-btn-sm mat-icon { font-size: 18px; height: 18px; width: 18px; }
  `]
})
export class SupplierListComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly suppliersService = inject(SuppliersService);
  private readonly notification = inject(NotificationService);
  readonly authService = inject(AuthService);

  readonly suppliers = signal<Supplier[]>([]);
  readonly loading = signal(true);
  readonly saving = signal(false);

  readonly form = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(200)]],
    contactPerson: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required]],
    gstNumber: ['']
  });

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading.set(true);
    this.suppliersService.getAll().subscribe({
      next: (sups) => { this.suppliers.set(sups); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.saving.set(true);
    const value = this.form.getRawValue();
    this.suppliersService.create({
      name: value.name!, contactPerson: value.contactPerson!, email: value.email!,
      phone: value.phone!, gstNumber: value.gstNumber || undefined
    }).subscribe({
      next: () => {
        this.saving.set(false);
        this.form.reset();
        this.notification.success('Supplier created.');
        this.load();
      },
      error: (err) => {
        this.saving.set(false);
        const errors = err.error?.errors;
        this.notification.error(Array.isArray(errors) ? errors.join(' ') : (err.error?.message ?? 'Failed to create supplier.'));
      }
    });
  }

  deleteSupplier(id: string): void {
    if (!confirm('Delete this supplier?')) return;
    this.suppliersService.delete(id).subscribe({
      next: () => { this.notification.success('Supplier deleted.'); this.load(); },
      error: (err) => this.notification.error(err.error?.message ?? 'Failed to delete supplier.')
    });
  }
}
