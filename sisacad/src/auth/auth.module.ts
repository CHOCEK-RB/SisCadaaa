import { Module } from '@nestjs/common';
import { UserModule } from 'src/users/users.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './presentation/controllers/auth.controller';
import { GoogleAuthService } from './application/services/google-auth.service';
import { JwtStrategy } from './presentation/strategies/jwt.strategy';
import { JwtPayloadMapper } from './application/mappers/jwt-payload.mapper';
import { CookieOptionsService } from './application/services/cookie-options.service';

/**
 * @module AuthModule
 * @description
 * Main module for handling all authentication-related functionalities.
 * It integrates user management, JWT handling, and Google authentication.
 */
@Module({
  imports: [
    UserModule, // Imports the UserModule to provide user-related services and repositories.
    PassportModule.register({ defaultStrategy: 'jwt' }), // Configures Passport.js with JWT as the default strategy.
    /**
     * @description
     * Asynchronously registers the JwtModule.
     * It uses ConfigService to retrieve the JWT secret and sets token expiration.
     */
    JwtModule.registerAsync({
      imports: [ConfigModule], // Imports ConfigModule to access environment variables.
      inject: [ConfigService], // Injects ConfigService.
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'), // Retrieves JWT secret from environment variables.
        signOptions: {
          expiresIn: '1d', // Sets JWT expiration time to 1 day.
        },
      }),
    }),
  ],
  controllers: [AuthController], // Registers AuthController to handle authentication-related API requests.
  providers: [
    GoogleAuthService, // Provides Google OAuth authentication logic.
    CookieOptionsService, // Provides services for setting cookie options.
    JwtStrategy, // Implements the JWT authentication strategy for Passport.js.
    JwtPayloadMapper, // Maps JWT payload data to application-specific user data.
  ],
  exports: [
    JwtStrategy, // Exports JwtStrategy for use in other modules that require authentication.
    PassportModule, // Exports PassportModule to make Passport's authentication capabilities available.
  ],
})
export class AuthModule {}
