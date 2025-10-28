export type UserRole =
  | 'student'
  | 'teacher'
  | 'secretary'
  | 'admin'
  | 'unknown';

export interface JwtPayload {
  sub: string;
  email: string;
  pictureURL: string;
}

export interface AuthenticatedUserInfo {
  id: string;
  email: string;
  pictureUrl?: string;
  isActive: boolean;
}

export interface UserProfileDTO {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  iconURL?: string;
  isActive: boolean;
}
