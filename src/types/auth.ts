// Auth-related types

export type UserRole = 'guest' | 'member' | 'translator' | 'group_admin' | 'moderator' | 'admin';

export interface User {
  id: string;
  name: string;         // backend field (was: displayName / username)
  email: string;
  avatarUrl: string | null;
  bio: string | null;
  role: UserRole;
  translationGroupId?: string | null;
  translationGroup?: {
    id: string;
    name: string;
    slug: string;
    logoUrl: string | null;
  } | null;
  createdAt: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;         // backend field (was: username)
  email: string;
  password: string;
  confirmPassword: string; // client-only validation, not sent to API
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  token: string;
  new_password: string; // backend field (was: password)
  confirmPassword: string; // client-only validation
}

// Server sets auth tokens as HTTP-only cookies — response only carries the user object
export interface AuthResponse {
  user: User;
}
