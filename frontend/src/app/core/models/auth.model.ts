export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role?: 'Admin' | 'Manager' | 'Staff';
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  userId: string;
  email: string;
  fullName: string;
  roles: string[];
}

export interface RefreshTokenRequest {
  accessToken: string;
  refreshToken: string;
}

export interface AuthUser {
  userId: string;
  email: string;
  fullName: string;
  roles: string[];
}
