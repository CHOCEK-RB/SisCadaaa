export type UserRole =
  | 'student'
  | 'teacher'
  | 'secretary'
  | 'admin'
  | 'unknown';

export abstract class UserProfileDTO {
  id: string;
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  abstract role: UserRole;
  isActive?: boolean;
}
