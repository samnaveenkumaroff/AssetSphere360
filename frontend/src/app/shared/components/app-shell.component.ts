import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, MatIconModule, MatMenuModule],
  template: `
    <header class="as-header">
      <a routerLink="/dashboard" class="as-header__brand">
        <span class="as-header__mark">AS</span>
        <div>
          <div class="as-header__title">AssetSphere 360</div>
          <div class="as-header__subtitle">Inventory Control</div>
        </div>
      </a>
      <div class="as-header__user">
        <button class="as-header__profile-btn" [matMenuTriggerFor]="userMenu">
          <span class="as-header__avatar">{{ initials() }}</span>
          <span class="as-header__name">{{ authService.currentUser()?.fullName }}</span>
          <mat-icon class="as-header__chevron">expand_more</mat-icon>
        </button>
        <mat-menu #userMenu="matMenu">
          <button mat-menu-item routerLink="/profile">
            <mat-icon>person</mat-icon><span>My Profile</span>
          </button>
          <button mat-menu-item (click)="authService.logout()">
            <mat-icon>logout</mat-icon><span>Sign Out</span>
          </button>
        </mat-menu>
      </div>
    </header>

    <nav class="as-nav">
      <a routerLink="/products" routerLinkActive="as-nav__item--active" class="as-nav__item">
        <mat-icon>inventory_2</mat-icon><span>Products</span>
      </a>
      <a routerLink="/categories" routerLinkActive="as-nav__item--active" class="as-nav__item">
        <mat-icon>category</mat-icon><span>Categories</span>
      </a>
      <a routerLink="/suppliers" routerLinkActive="as-nav__item--active" class="as-nav__item">
        <mat-icon>local_shipping</mat-icon><span>Suppliers</span>
      </a>
      <a routerLink="/stock-movements" routerLinkActive="as-nav__item--active" class="as-nav__item">
        <mat-icon>swap_horiz</mat-icon><span>Movements</span>
      </a>
      <a routerLink="/purchase-orders" routerLinkActive="as-nav__item--active" class="as-nav__item">
        <mat-icon>shopping_cart</mat-icon><span>Purchase Orders</span>
      </a>
      <a routerLink="/sales-orders" routerLinkActive="as-nav__item--active" class="as-nav__item">
        <mat-icon>point_of_sale</mat-icon><span>Sales Orders</span>
      </a>
    </nav>
  `,
  styles: [`
    .as-header {
      display: flex; justify-content: space-between; align-items: center;
      padding: 14px 24px; background: var(--as-ink-900); color: white;
    }
    .as-header__brand { display: flex; align-items: center; gap: 12px; text-decoration: none; color: white; }
    .as-header__mark {
      width: 36px; height: 36px; border-radius: 6px; background: var(--as-amber-500);
      color: var(--as-ink-900); display: flex; align-items: center; justify-content: center;
      font-weight: 700; font-size: 14px; font-family: 'JetBrains Mono', monospace; flex-shrink: 0;
    }
    .as-header__title { font-weight: 600; font-size: 15px; letter-spacing: -0.01em; }
    .as-header__subtitle { font-size: 11px; color: rgba(255,255,255,0.6); text-transform: uppercase; letter-spacing: 0.06em; }

    .as-header__user { display: flex; align-items: center; }
    .as-header__profile-btn {
      display: flex; align-items: center; gap: 10px; background: rgba(255,255,255,0.06);
      border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 6px 10px 6px 6px;
      cursor: pointer; color: white; transition: background 0.15s;
    }
    .as-header__profile-btn:hover { background: rgba(255,255,255,0.12); }
    .as-header__avatar {
      width: 26px; height: 26px; border-radius: 50%; background: var(--as-amber-500);
      color: var(--as-ink-900); display: flex; align-items: center; justify-content: center;
      font-size: 11px; font-weight: 700; font-family: 'JetBrains Mono', monospace;
    }
    .as-header__name { font-size: 13px; color: rgba(255,255,255,0.9); }
    .as-header__chevron { font-size: 18px; height: 18px; width: 18px; color: rgba(255,255,255,0.6); }

    .as-nav {
      display: flex; gap: 2px; padding: 0 24px; background: var(--as-ink-800);
      border-bottom: 1px solid var(--as-ink-700);
    }
    .as-nav__item {
      display: flex; align-items: center; gap: 6px; padding: 12px 16px;
      color: rgba(255,255,255,0.65); text-decoration: none; font-size: 13px; font-weight: 500;
      border-bottom: 2px solid transparent; transition: all 0.15s;
    }
    .as-nav__item:hover { color: white; }
    .as-nav__item--active { color: white; border-bottom-color: var(--as-amber-500); }
    .as-nav__item mat-icon { font-size: 18px; height: 18px; width: 18px; }
  `]
})
export class AppShellComponent {
  readonly authService = inject(AuthService);

  initials(): string {
    const name = this.authService.currentUser()?.fullName ?? '';
    return name.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase();
  }
}
