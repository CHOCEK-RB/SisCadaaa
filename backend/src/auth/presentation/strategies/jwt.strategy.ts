import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InternalServerErrorException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from '../../domain/interfaces/jwt-payload.interface';
import { IUserRepository } from 'src/users/domain/repositories/iuser.repository';
import { Inject } from '@nestjs/common';
import { JwtPayloadMapper } from '../../application/mappers/jwt-payload.mapper';
import { Request } from 'express';

/**
 * @class JwtStrategy
 * @extends PassportStrategy(Strategy)
 * @description
 * Implements the JWT authentication strategy for Passport.js.
 * This strategy is responsible for extracting, verifying, and validating JSON Web Tokens.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  /**
   * @constructor
   * @param {ConfigService} configService - Service for accessing configuration variables.
   * @param {IUserRepository} userRepository - Repository for user data access.
   * @param {JwtPayloadMapper} jwtPayloadMapper - Mapper for converting User entity to JwtPayload.
   */
  constructor(
    private readonly configService: ConfigService,
    @Inject(IUserRepository)
    private readonly userRepository: IUserRepository,
    private readonly jwtPayloadMapper: JwtPayloadMapper,
  ) {
    const jwtSecret = configService.get<string>('JWT_SECRET'); // Retrieves JWT secret from config.

    if (!jwtSecret) {
      throw new InternalServerErrorException(
        'JWT_SECRET environment variable is not defined.', // Ensures JWT_SECRET is configured.
      );
    }

    super({
      /**
       * @method jwtFromRequest
       * @description
       * Defines how the JWT is extracted from the incoming request.
       * It first tries to get the token from the 'auth_token' cookie, then falls back to the Authorization header.
       * @param {Request} req - The Express request object.
       * @returns {string | null} The extracted JWT or null if not found.
       */
      jwtFromRequest: (req: Request) => {
        // First attempt to get the token from the cookie
        if (req && req.cookies) {
          return req.cookies['auth_token'];
        }
        // As a fallback, try to get it from the header
        return ExtractJwt.fromAuthHeaderAsBearerToken()(req);
      },
      ignoreExpiration: false, // JWT expiration is enforced.
      secretOrKey: jwtSecret, // Secret key used to verify the JWT's signature.
    });
  }

  /**
   * @method validate
   * @description
   * Validates the JWT payload. It verifies if the user exists and is active.
   * If valid, it maps the user's information to an authenticated JWT payload.
   * @param {JwtPayload} payload - The decoded JWT payload.
   * @returns {Promise<JwtPayload>} The authenticated user's information.
   * @throws {UnauthorizedException} If the user is not found or is inactive.
   */
  async validate(payload: JwtPayload) {
    const { sub: id, pictureURL } = payload; // Extracts user ID and pictureURL from payload.

    const user = await this.userRepository.findById(id); // Finds the user by ID.

    if (!user || !user.isActive) {
      throw new UnauthorizedException(); // Throws if user is not found or is inactive.
    }

    // Maps the User entity to a JwtPayload to standardize authenticated user info.
    const authenticateduserinfo: JwtPayload =
      this.jwtPayloadMapper.toJwtPayload(user, pictureURL || "");

    return authenticateduserinfo;
  }
}
