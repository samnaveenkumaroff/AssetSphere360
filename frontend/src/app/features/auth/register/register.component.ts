import { Component, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterLink,
    MatCardModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatProgressSpinnerModule
  ],
  template: `
    <div class="register-container">
      <mat-card class="register-card">
        <mat-card-header>
          <mat-card-title>Create Account</mat-card-title>
          <mat-card-subtitle>Join AssetSphere 360</mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <form [formGroup]="form" (ngSubmit)="onSubmit()">
            <div class="name-row">
              <mat-form-field appearance="outline">
                <mat-label>First Name</mat-label>
                <input matInput formControlName="firstName" />
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Last Name</mat-label>
                <input matInput formControlName="lastName" />
              </mat-form-field>
            </div>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Email</mat-label>
              <input matInput type="email" formControlName="email" />
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Password</mat-label>
              <input matInput type="password" formControlName="password" />
              <mat-hint>Min 8 chars, upper, lower, digit, special char</mat-hint>
            </mat-form-field>

            @if (errorMessage()) {
              <p class="error-text">{{ errorMessage() }}</p>
            }

            <button mat-flat-button color="primary" type="submit"
                    class="full-width submit-btn" [disabled]="form.invalid || loading()">
              @if (loading()) {
                <mat-spinner diameter="20" />
              } @else {
                Create Account
              }
            </button>
          </form>
        </mat-card-content>

        <mat-card-footer>
          <p class="login-link">
            Already have an account? <a routerLink="/login">Sign in</a>
          </p>
        </mat-card-footer>
      </mat-card>
    </div>
  `,
  styles: [`
    .register-container {
      display: flex; justify-content: center; align-items: center;
      min-height: 100vh; background: #f5f5f5; padding: 16px;
    }
    .register-card { width: 100%; max-width: 440px; padding: 24px; }
    .name-row { display: flex; gap: 12px; }
    .name-row mat-form-field { flex: 1; }
    .full-width { width: 100%; margin-bottom: 8px; }
    .submit-btn { margin-top: 16px; height: 44px; }
    .error-text { color: #d32f2f; font-size: 14px; margin: 8px 0; }
    .login-link { text-align: center; margin: 16px 0 0; font-size: 14px; }
  `]
})
export class RegisterComponent {
  readonly loading = signal(false);
  readonly errorMessage = signal<string | null>(null);

  form = this.fb.group({
    firstName: ['', [Validators.required]],
    lastName: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]]
  });

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit(): void {
    if (this.form.invalid) return;

    this.loading.set(true);
    this.errorMessage.set(null);

    const value = this.form.getRawValue();
    this.authService.register({
      firstName: value.firstName!,
      lastName: value.lastName!,
      email: value.email!,
      password: value.password!,
      role: 'Staff'
    }).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/products']);
      },
      error: (err) => {
        this.loading.set(false);
        const errors = err.error?.errors;
        this.errorMessage.set(
          Array.isArray(errors) ? errors.join(' ') : (err.error?.message ?? 'Registration failed.')
        );
      }
    });
  }
}
