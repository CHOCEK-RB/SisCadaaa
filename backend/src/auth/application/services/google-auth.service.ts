import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
  Inject,
} from '@nestjs/common';

import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { OAuth2Client } from 'google-auth-library';
import { IUserRepository } from 'src/users/domain/repositories/iuser.repository';
import { JwtPayload } from '../../domain/interfaces/jwt-payload.interface';
import { JwtPayloadMapper } from '../mappers/jwt-payload.mapper';

/**
 * @class GoogleAuthService
 * @description
 * Service responsible for handling Google OAuth authentication.
 * It verifies Google ID tokens, authorizes users, and issues application-specific JWTs.
 */
@Injectable()
export class GoogleAuthService {
  private readonly client: OAuth2Client;
  private readonly audience: string;

  /**
   * @constructor
   * @param {ConfigService} configService - Service for accessing configuration variables.
   * @param {JwtService} jwtService - Service for signing and verifying JWTs.
   * @param {IUserRepository} userRepository - Repository for user data access.
   * @param {JwtPayloadMapper} jwtPayloadMapper - Mapper for converting User entity to JwtPayload.
   */
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    @Inject(IUserRepository)
    private readonly userRepository: IUserRepository,
    private readonly jwtPayloadMapper: JwtPayloadMapper,
  ) {
    this.audience = this.configService.get('GOOGLE_CLIENT_ID') || 'none'; // Retrieves Google Client ID from config.
    this.client = new OAuth2Client(this.audience); // Initializes OAuth2Client with the client ID.
  }

  /**
   * @method verifyTokenAndAuthorize
   * @description
   * Verifies the provided Google ID token, checks user authorization, and issues an application-specific access token.
   * @param {string} idToken - The ID token received from Google's OAuth flow.
   * @returns {Promise<{ accessToken: string }>} An object containing the application's access token.
   * @throws {UnauthorizedException} If the Google token is invalid or the email is not registered.
   * @throws {ForbiddenException} If the user account is inactive.
   */
  async verifyTokenAndAuthorize(
    idToken: string,
  ): Promise<{ accessToken: string }> {
    const ticket = await this.client.verifyIdToken({
      idToken,
      audience: this.audience,
    });
    const payload = ticket.getPayload(); // Extracts the payload from the verified token.

    if (!payload || !payload.email) {
      throw new UnauthorizedException('Invalid Google token'); // Throws if token is invalid or missing email.
    }

    const user = await this.userRepository.findByEmail(payload.email); // Finds user by email in the database.

    if (!user) {
      throw new UnauthorizedException(
        `Email ${payload.email} is not registered in the system.`, // Throws if email is not registered.
      );
    }

    if (!user.isActive) {
      throw new ForbiddenException(
        'User account is inactive. Please contact an administrator.', // Throws if user account is inactive.
      );
    }

    // Links Google ID to user if not already linked.
    if (!user.googleId) {
      user.linkGoogleProvider(payload.sub);
      await this.userRepository.save(user);
    }

    const jwtPayload: JwtPayload = this.jwtPayloadMapper.toJwtPayload(
      user,
      payload.picture || '', // Maps user data and picture to JWT payload.
    );

    const accessToken = this.jwtService.sign(jwtPayload); // Signs the JWT payload to create an access token.

    return { accessToken };
  }
}
