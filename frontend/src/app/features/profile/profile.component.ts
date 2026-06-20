import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AppShellComponent } from '../../shared/components/app-shell.component';
import { AuthService } from '../../core/services/auth.service';
import { UserProfile } from '../../core/models/profile.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatProgressSpinnerModule, AppShellComponent],
  template: `
    <app-shell></app-shell>

    <main class="as-main">
      @if (loading()) {
        <div class="as-loading"><mat-spinner diameter="32" /></div>
      } @else if (error()) {
        <div class="as-card as-error-panel">
          <mat-icon>cloud_off</mat-icon>
          <div>
            <div class="as-error-title">Couldn't reach the server</div>
            <div class="as-error-detail">{{ error() }}</div>
          </div>
        </div>
      } @else if (profile()) {
        <div class="as-profile-card as-card">
          <div class="as-profile-header">
            <span class="as-profile-avatar">{{ initials() }}</span>
            <div>
              <div class="as-profile-name">{{ profile()!.fullName }}</div>
              <div class="as-profile-email">{{ profile()!.email }}</div>
            </div>
          </div>

          <div class="as-profile-roles">
            @for (role of profile()!.roles; track role) {
              <span class="as-role-badge" [class]="'as-role-badge--' + role.toLowerCase()">{{ role }}</span>
            }
          </div>

          <dl class="as-profile-details">
            <div class="as-profile-row">
              <dt>User ID</dt>
              <dd class="as-mono">{{ profile()!.userId }}</dd>
            </div>
            <div class="as-profile-row">
              <dt>Account Created</dt>
              <dd>{{ profile()!.createdAt | date:'medium' }}</dd>
            </div>
            <div class="as-profile-row">
              <dt>Last Sign In</dt>
              <dd>{{ profile()!.lastLoginAt ? (profile()!.lastLoginAt | date:'medium') : '—' }}</dd>
            </div>
          </dl>
        </div>
      }
    </main>
  `,
  styles: [`
    .as-main { padding: 24px; max-width: 640px; margin: 0 auto; }
    .as-loading { display: flex; justify-content: center; padding: 64px; }

    .as-error-panel { display: flex; align-items: center; gap: 14px; padding: 20px; }
    .as-error-panel mat-icon { color: var(--as-critical); font-size: 28px; height: 28px; width: 28px; }
    .as-error-title { font-weight: 600; color: var(--as-ink-text); font-size: 14px; }
    .as-error-detail { font-size: 12px; color: var(--as-ink-muted); margin-top: 2px; }

    .as-profile-card { padding: 28px; }
    .as-profile-header { display: flex; align-items: center; gap: 16px; margin-bottom: 20px; }
    .as-profile-avatar {
      width: 56px; height: 56px; border-radius: 50%; background: var(--as-ink-900);
      color: var(--as-amber-500); display: flex; align-items: center; justify-content: center;
      font-size: 18px; font-weight: 700; font-family: 'JetBrains Mono', monospace; flex-shrink: 0;
    }
    .as-profile-name { font-size: 18px; font-weight: 600; color: var(--as-ink-text); }
    .as-profile-email { font-size: 13px; color: var(--as-ink-muted); }

    .as-profile-roles { display: flex; gap: 8px; margin-bottom: 24px; }
    .as-role-badge {
      font-size: 11px; font-weight: 600; padding: 4px 10px; border-radius: 100px;
      text-transform: uppercase; letter-spacing: 0.04em;
    }
    .as-role-badge--admin { background: var(--as-ink-900); color: var(--as-amber-500); }
    .as-role-badge--manager { background: var(--as-transfer-bg); color: var(--as-transfer); }
    .as-role-badge--staff { background: var(--as-paper-dim); color: var(--as-ink-muted); }

    .as-profile-details { margin: 0; border-top: 1px solid var(--as-border); padding-top: 16px; }
    .as-profile-row {
      display: flex; justify-content: space-between; padding: 10px 0;
      border-bottom: 1px solid var(--as-border); font-size: 13px;
    }
    .as-profile-row:last-child { border-bottom: none; }
    .as-profile-row dt { color: var(--as-ink-muted); margin: 0; }
    .as-profile-row dd { margin: 0; color: var(--as-ink-text); font-weight: 500; }
  `]
})
export class ProfileComponent implements OnInit {
  private readonly authService = inject(AuthService);

  readonly profile = signal<UserProfile | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  ngOnInit(): void {
    this.authService.getProfile().subscribe({
      next: (p) => { this.profile.set(p); this.loading.set(false); },
      error: (err) => {
        const detail = err.status === 0
          ? 'The API server is not responding. Make sure it is running on port 5000.'
          : (err.error?.message ?? err.message ?? 'Unknown error');
        this.error.set(detail);
        this.loading.set(false);
      }
    });
  }

  initials(): string {
    const name = this.profile()?.fullName ?? '';
    return name.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase();
  }
}
