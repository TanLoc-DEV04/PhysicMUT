export interface RolePermissions {
  [category: string]: string[];
}

export interface Role {
  id?: string;
  name: string;
  permissions?: RolePermissions | any;
  is_active?: boolean;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: string | Role;
  class?: string;
  avatar?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  role?: 'student' | 'teacher';
  class?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken?: string;
  expiresIn?: number;
}

export interface TokenResponse {
  token: string;
  refreshToken?: string;
  expiresIn?: number;
}
