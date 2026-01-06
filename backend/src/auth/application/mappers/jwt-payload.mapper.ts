import { Injectable } from '@nestjs/common';
import { User } from 'src/users/domain/aggregates/user.entity';
import { JwtPayload } from '../../domain/interfaces/jwt-payload.interface';

/**
 * @class JwtPayloadMapper
 * @description
 * Mapper class responsible for transforming a `User` entity into a `JwtPayload` object.
 * This payload is then signed to create a JSON Web Token (JWT) for user authentication.
 */
@Injectable()
export class JwtPayloadMapper {
  /**
   * @method toJwtPayload
   * @description
   * Converts a `User` entity and a picture URL into a `JwtPayload` object.
   * The user's role is determined based on the presence of associated profiles (student, teacher, secretary, admin).
   * @param {User} user - The user entity from which to extract information.
   * @param {string} pictureURL - The URL of the user's profile picture.
   * @returns {JwtPayload} The JWT payload containing user ID, email, picture URL, and determined role.
   */
  toJwtPayload(user: User, pictureURL: string): JwtPayload {
    const jwtPayload: JwtPayload = {
      sub: user.id, // Subject (user ID)
      email: user.email, // User's email address
      pictureURL: pictureURL, // URL of the user's profile picture
      role: 'unknown', // Default role
    };

    // Determine the user's role based on associated profiles
    if (user.studentProfile) {
      jwtPayload.role = 'student';
    } else if (user.teacherProfile) {
      jwtPayload.role = 'teacher';
    } else if (user.secretaryProfile) {
      jwtPayload.role = 'secretary';
    } else if (user.adminProfile) {
      jwtPayload.role = 'admin';
    }

    return jwtPayload;
  }
}
