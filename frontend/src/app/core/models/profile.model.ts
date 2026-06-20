export interface UserProfile {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  roles: string[];
  createdAt: string;
  lastLoginAt: string | null;
}
