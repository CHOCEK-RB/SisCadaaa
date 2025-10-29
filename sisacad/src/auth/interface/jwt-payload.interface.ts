export interface JwtPayload {
  sub: string;
  email: string;
  pictureURL: string;
  role: 'student' | 'teacher' | 'secretary' | 'admin' | 'unknown';
}
