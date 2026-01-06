/**
 * @interface JwtPayload
 * @description
 * Defines the structure of the data contained within the application's JSON Web Tokens (JWTs).
 * This payload carries essential user information for authentication and authorization across the system.
 */
export interface JwtPayload {
  /**
   * @property {string} sub - The subject of the JWT, typically the user's unique identifier (ID).
   */
  sub: string;
  /**
   * @property {string} email - The user's email address.
   */
  email: string;
  /**
   * @property {string} pictureURL - The URL of the user's profile picture.
   */
  pictureURL: string;
  /**
   * @property {'student' | 'teacher' | 'secretary' | 'admin' | 'unknown'} role - The role of the user within the application, determining their permissions.
   */
  role: 'student' | 'teacher' | 'secretary' | 'admin' | 'unknown';
}
