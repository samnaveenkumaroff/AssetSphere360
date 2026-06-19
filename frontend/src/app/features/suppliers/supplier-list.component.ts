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
import { MatChipsModule } from '@angular/material/chips';
import { SuppliersService } from '../../core/services/suppliers.service';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { Supplier } from '../../core/models/supplier.model';

@Component({
  selector: 'app-supplier-list',
  standalone: true,
  imports: [
    CommonModule, RouterLink, ReactiveFormsModule, MatToolbarModule, MatIconModule,
    MatCardModule, MatTableModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatChipsModule
  ],
  template: `
    <mat-toolbar color="primary">
      <button mat-icon-button routerLink="/dashboard"><mat-icon>arrow_back</mat-icon></button>
      <span>Suppliers</span>
    </mat-toolbar>

    <div class="page-container">
      <mat-card class="form-card">
        <mat-card-header><mat-card-title>New Supplier</mat-card-title></mat-card-header>
        <mat-card-content>
          <form [formGroup]="form" (ngSubmit)="onSubmit()">
            <div class="form-row">
              <mat-form-field appearance="outline" class="flex-1">
                <mat-label>Company Name</mat-label>
                <input matInput formControlName="name" />
              </mat-form-field>
              <mat-form-field appearance="outline" class="flex-1">
                <mat-label>Contact Person</mat-label>
                <input matInput formControlName="contactPerson" />
              </mat-form-field>
            </div>
            <div class="form-row">
              <mat-form-field appearance="outline" class="flex-1">
                <mat-label>Email</mat-label>
                <input matInput type="email" formControlName="email" />
              </mat-form-field>
              <mat-form-field appearance="outline" class="flex-1">
                <mat-label>Phone</mat-label>
                <input matInput formControlName="phone" />
              </mat-form-field>
              <mat-form-field appearance="outline" class="flex-1">
                <mat-label>GST Number (optional)</mat-label>
                <input matInput formControlName="gstNumber" />
              </mat-form-field>
            </div>
            <button mat-flat-button color="primary" type="submit" [disabled]="form.invalid || saving()">
              <mat-icon>add</mat-icon> Add Supplier
            </button>
          </form>
        </mat-card-content>
      </mat-card>

      @if (loading()) {
        <p class="empty-state">Loading...</p>
      } @else if (suppliers().length === 0) {
        <p class="empty-state">No suppliers yet. Add one above.</p>
      } @else {
        <table mat-table [dataSource]="suppliers()" class="full-width-table">
          <ng-container matColumnDef="name">
            <th mat-header-cell *matHeaderCellDef>Name</th>
            <td mat-cell *matCellDef="let s">{{ s.name }}</td>
          </ng-container>
          <ng-container matColumnDef="contact">
            <th mat-header-cell *matHeaderCellDef>Contact</th>
            <td mat-cell *matCellDef="let s">{{ s.contactPerson }} — {{ s.email }}</td>
          </ng-container>
          <ng-container matColumnDef="phone">
            <th mat-header-cell *matHeaderCellDef>Phone</th>
            <td mat-cell *matCellDef="let s">{{ s.phone }}</td>
          </ng-container>
          <ng-container matColumnDef="productCount">
            <th mat-header-cell *matHeaderCellDef>Products</th>
            <td mat-cell *matCellDef="let s">{{ s.productCount }}</td>
          </ng-container>
          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef>Actions</th>
            <td mat-cell *matCellDef="let s">
              @if (authService.isAdmin() && s.productCount === 0) {
                <button mat-icon-button color="warn" (click)="deleteSupplier(s.id)">
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
    .page-container { padding: 24px; max-width: 1000px; margin: 0 auto; }
    .form-card { margin-bottom: 16px; }
    .form-row { display: flex; gap: 16px; }
    .flex-1 { flex: 1; }
    .full-width-table { width: 100%; }
    .empty-state { text-align: center; color: #666; padding: 32px; }
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
  readonly columns = ['name', 'contact', 'phone', 'productCount', 'actions'];

  readonly form = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(200)]],
    contactPerson: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required]],
    gstNumber: ['']
  });

  ngOnInit(): void {
    this.load();
  }

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
      name: value.name!,
      contactPerson: value.contactPerson!,
      email: value.email!,
      phone: value.phone!,
      gstNumber: value.gstNumber || undefined
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
