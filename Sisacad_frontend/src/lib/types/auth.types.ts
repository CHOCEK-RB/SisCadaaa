export type UserRole =
  | 'student'
  | 'teacher'
  | 'secretary'
  | 'admin'
  | 'unknown';

export interface UserSession {
  sub: string;
  email: string;
  pictureURL: string;
  role?: UserRole;
  iat?: number;
  exp: number;
}

export interface LoginResponse {
  accessToken: string;
  user?: UserSession;
}

export interface UserProfileDTO {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  iconURL?: string;
  isActive: boolean;
  cui?: string;
  semester?: number;
}
