import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { ProductsService } from '../../../core/services/products.service';
import { CategoriesService } from '../../../core/services/categories.service';
import { SuppliersService } from '../../../core/services/suppliers.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Category } from '../../../core/models/category.model';
import { Supplier } from '../../../core/models/supplier.model';
import { UnitOfMeasure } from '../../../core/models/product.model';

const UNITS: UnitOfMeasure[] = ['Piece', 'Kilogram', 'Gram', 'Litre', 'Millilitre', 'Metre', 'Box', 'Carton', 'Pallet'];

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatCardModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, MatButtonModule, MatToolbarModule, MatIconModule
  ],
  template: `
    <mat-toolbar color="primary">
      <button mat-icon-button (click)="router.navigate(['/products'])">
        <mat-icon>arrow_back</mat-icon>
      </button>
      <span>{{ isEditMode() ? 'Edit Product' : 'New Product' }}</span>
    </mat-toolbar>

    <div class="page-container">
      <mat-card>
        <mat-card-content>
          <form [formGroup]="form" (ngSubmit)="onSubmit()">
            <div class="form-row">
              <mat-form-field appearance="outline" class="flex-2">
                <mat-label>Product Name</mat-label>
                <input matInput formControlName="name" />
              </mat-form-field>

              <mat-form-field appearance="outline" class="flex-1">
                <mat-label>SKU</mat-label>
                <input matInput formControlName="sku" [readonly]="isEditMode()" />
                <mat-hint>Uppercase letters, numbers, hyphens only</mat-hint>
              </mat-form-field>
            </div>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Description</mat-label>
              <textarea matInput formControlName="description" rows="2"></textarea>
            </mat-form-field>

            <div class="form-row">
              <mat-form-field appearance="outline" class="flex-1">
                <mat-label>Category</mat-label>
                <mat-select formControlName="categoryId">
                  @for (cat of categories(); track cat.id) {
                    <mat-option [value]="cat.id">{{ cat.name }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline" class="flex-1">
                <mat-label>Supplier (optional)</mat-label>
                <mat-select formControlName="supplierId">
                  <mat-option [value]="null">None</mat-option>
                  @for (sup of suppliers(); track sup.id) {
                    <mat-option [value]="sup.id">{{ sup.name }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-form-field appearance="outline" class="flex-1">
                <mat-label>Cost Price (₹)</mat-label>
                <input matInput type="number" formControlName="costAmount" min="0" step="0.01" />
              </mat-form-field>

              <mat-form-field appearance="outline" class="flex-1">
                <mat-label>Selling Price (₹)</mat-label>
                <input matInput type="number" formControlName="sellingAmount" min="0" step="0.01" />
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-form-field appearance="outline" class="flex-1">
                <mat-label>Unit of Measure</mat-label>
                <mat-select formControlName="unit">
                  @for (u of units; track u) {
                    <mat-option [value]="u">{{ u }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline" class="flex-1">
                <mat-label>Reorder Level</mat-label>
                <input matInput type="number" formControlName="reorderLevel" min="0" />
              </mat-form-field>
            </div>

            <div class="form-actions">
              <button mat-button type="button" (click)="router.navigate(['/products'])">Cancel</button>
              <button mat-flat-button color="primary" type="submit" [disabled]="form.invalid || saving()">
                {{ saving() ? 'Saving...' : (isEditMode() ? 'Update Product' : 'Create Product') }}
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .page-container { padding: 24px; max-width: 800px; margin: 0 auto; }
    .form-row { display: flex; gap: 16px; }
    .form-row mat-form-field { flex: 1; }
    .flex-1 { flex: 1; }
    .flex-2 { flex: 2; }
    .full-width { width: 100%; }
    .form-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 16px; }
  `]
})
export class ProductFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly productsService = inject(ProductsService);
  private readonly categoriesService = inject(CategoriesService);
  private readonly suppliersService = inject(SuppliersService);
  private readonly notification = inject(NotificationService);
  private readonly route = inject(ActivatedRoute);
  protected readonly router = inject(Router);

  readonly categories = signal<Category[]>([]);
  readonly suppliers = signal<Supplier[]>([]);
  readonly saving = signal(false);
  readonly isEditMode = signal(false);
  readonly units = UNITS;

  private productId: string | null = null;

  readonly form = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(200)]],
    sku: ['', [Validators.required, Validators.pattern(/^[A-Z0-9-]+$/)]],
    description: [''],
    categoryId: ['', [Validators.required]],
    supplierId: [null as string | null],
    costAmount: [0, [Validators.required, Validators.min(0)]],
    sellingAmount: [0, [Validators.required, Validators.min(0.01)]],
    unit: ['Piece' as UnitOfMeasure, [Validators.required]],
    reorderLevel: [0, [Validators.required, Validators.min(0)]]
  });

  ngOnInit(): void {
    this.categoriesService.getAll().subscribe(cats => this.categories.set(cats));
    this.suppliersService.getAll().subscribe(sups => this.suppliers.set(sups));

    this.productId = this.route.snapshot.paramMap.get('id');
    if (this.productId) {
      this.isEditMode.set(true);
      this.productsService.getById(this.productId).subscribe(product => {
        this.form.patchValue({
          name: product.name,
          sku: product.sku,
          description: product.description ?? '',
          categoryId: product.categoryId,
          supplierId: product.supplierId,
          costAmount: product.costAmount,
          sellingAmount: product.sellingAmount,
          unit: product.unit,
          reorderLevel: product.reorderLevel
        });
      });
    }
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    this.saving.set(true);
    const value = this.form.getRawValue();

    const payload = {
      name: value.name!,
      categoryId: value.categoryId!,
      costAmount: value.costAmount!,
      sellingAmount: value.sellingAmount!,
      unit: value.unit!,
      reorderLevel: value.reorderLevel!,
      description: value.description || undefined,
      supplierId: value.supplierId || undefined
    };

    const request$ = this.isEditMode() && this.productId
      ? this.productsService.update(this.productId, payload)
      : this.productsService.create({ ...payload, sku: value.sku! });

    request$.subscribe({
      next: () => {
        this.saving.set(false);
        this.notification.success(this.isEditMode() ? 'Product updated.' : 'Product created.');
        this.router.navigate(['/products']);
      },
      error: (err) => {
        this.saving.set(false);
        this.notification.error(err.error?.message ?? 'Failed to save product.');
      }
    });
  }
}
