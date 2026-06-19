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
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { CategoriesService } from '../../core/services/categories.service';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { Category } from '../../core/models/category.model';

@Component({
  selector: 'app-category-list',
  standalone: true,
  imports: [
    CommonModule, RouterLink, ReactiveFormsModule, MatToolbarModule, MatIconModule,
    MatCardModule, MatTableModule, MatButtonModule, MatFormFieldModule, MatInputModule
  ],
  template: `
    <mat-toolbar color="primary">
      <button mat-icon-button routerLink="/dashboard"><mat-icon>arrow_back</mat-icon></button>
      <span>Categories</span>
    </mat-toolbar>

    <div class="page-container">
      <mat-card class="form-card">
        <mat-card-content>
          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="inline-form">
            <mat-form-field appearance="outline" class="flex-1">
              <mat-label>Category Name</mat-label>
              <input matInput formControlName="name" />
            </mat-form-field>
            <mat-form-field appearance="outline" class="flex-2">
              <mat-label>Description (optional)</mat-label>
              <input matInput formControlName="description" />
            </mat-form-field>
            <button mat-flat-button color="primary" type="submit" [disabled]="form.invalid || saving()">
              <mat-icon>add</mat-icon> Add
            </button>
          </form>
        </mat-card-content>
      </mat-card>

      @if (loading()) {
        <p class="empty-state">Loading...</p>
      } @else if (categories().length === 0) {
        <p class="empty-state">No categories yet. Add one above.</p>
      } @else {
        <table mat-table [dataSource]="categories()" class="full-width-table">
          <ng-container matColumnDef="name">
            <th mat-header-cell *matHeaderCellDef>Name</th>
            <td mat-cell *matCellDef="let c">{{ c.name }}</td>
          </ng-container>
          <ng-container matColumnDef="description">
            <th mat-header-cell *matHeaderCellDef>Description</th>
            <td mat-cell *matCellDef="let c">{{ c.description || '—' }}</td>
          </ng-container>
          <ng-container matColumnDef="productCount">
            <th mat-header-cell *matHeaderCellDef>Products</th>
            <td mat-cell *matCellDef="let c">{{ c.productCount }}</td>
          </ng-container>
          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef>Actions</th>
            <td mat-cell *matCellDef="let c">
              @if (authService.isAdmin() && c.productCount === 0) {
                <button mat-icon-button color="warn" (click)="deleteCategory(c.id)">
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
    .page-container { padding: 24px; max-width: 900px; margin: 0 auto; }
    .form-card { margin-bottom: 16px; }
    .inline-form { display: flex; gap: 12px; align-items: flex-start; }
    .flex-1 { flex: 1; }
    .flex-2 { flex: 2; }
    .full-width-table { width: 100%; }
    .empty-state { text-align: center; color: #666; padding: 32px; }
  `]
})
export class CategoryListComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly categoriesService = inject(CategoriesService);
  private readonly notification = inject(NotificationService);
  readonly authService = inject(AuthService);

  readonly categories = signal<Category[]>([]);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly columns = ['name', 'description', 'productCount', 'actions'];

  readonly form = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(200)]],
    description: ['']
  });

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.categoriesService.getAll().subscribe({
      next: (cats) => { this.categories.set(cats); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.saving.set(true);
    const { name, description } = this.form.getRawValue();
    this.categoriesService.create({ name: name!, description: description || undefined }).subscribe({
      next: () => {
        this.saving.set(false);
        this.form.reset();
        this.notification.success('Category created.');
        this.load();
      },
      error: (err) => {
        this.saving.set(false);
        this.notification.error(err.error?.message ?? 'Failed to create category.');
      }
    });
  }

  deleteCategory(id: string): void {
    if (!confirm('Delete this category?')) return;
    this.categoriesService.delete(id).subscribe({
      next: () => { this.notification.success('Category deleted.'); this.load(); },
      error: (err) => this.notification.error(err.error?.message ?? 'Failed to delete category.')
    });
  }
}
