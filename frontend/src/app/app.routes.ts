import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { managerUpGuard } from './core/guards/role.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'products',
    canActivate: [authGuard],
    loadComponent: () => import('./features/products/product-list/product-list.component').then(m => m.ProductListComponent)
  },
  {
    path: 'products/new',
    canActivate: [authGuard, managerUpGuard],
    loadComponent: () => import('./features/products/product-form/product-form.component').then(m => m.ProductFormComponent)
  },
  {
    path: 'products/:id/edit',
    canActivate: [authGuard, managerUpGuard],
    loadComponent: () => import('./features/products/product-form/product-form.component').then(m => m.ProductFormComponent)
  },
  {
    path: 'categories',
    canActivate: [authGuard],
    loadComponent: () => import('./features/categories/category-list.component').then(m => m.CategoryListComponent)
  },
  {
    path: 'suppliers',
    canActivate: [authGuard],
    loadComponent: () => import('./features/suppliers/supplier-list.component').then(m => m.SupplierListComponent)
  },
  {
    path: 'stock-movements',
    canActivate: [authGuard],
    loadComponent: () => import('./features/stock-movements/stock-movement-list.component').then(m => m.StockMovementListComponent)
  },
  {
    path: 'profile',
    canActivate: [authGuard],
    loadComponent: () => import('./features/profile/profile.component').then(m => m.ProfileComponent)
  },
  {
    path: 'purchase-orders',
    canActivate: [authGuard],
    loadComponent: () => import('./features/purchase-orders/purchase-order-list.component').then(m => m.PurchaseOrderListComponent)
  },
  {
    path: 'sales-orders',
    canActivate: [authGuard],
    loadComponent: () => import('./features/sales-orders/sales-order-list.component').then(m => m.SalesOrderListComponent)
  },
  { path: '**', redirectTo: '/dashboard' }
];
