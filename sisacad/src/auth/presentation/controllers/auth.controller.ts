import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { GoogleAuthService } from '../../application/services/google-auth.service';
import { CookieOptionsService } from '../../application/services/cookie-options.service';
import { GoogleLoginDto } from '../../application/dto/google-login.dto';

/**
 * @class AuthController
 * @description
 * Controller responsible for handling authentication-related HTTP requests.
 * It provides endpoints for Google login and user logout, managing JWTs via HTTP-only cookies.
 */
@Controller('auth')
export class AuthController {
  /**
   * @constructor
   * @param {GoogleAuthService} googleAuthService - Service for Google authentication logic.
   * @param {CookieOptionsService} cookieOptionsService - Service for managing cookie options.
   */
  constructor(
    private readonly googleAuthService: GoogleAuthService,
    private readonly cookieOptionsService: CookieOptionsService,
  ) {}

  /**
   * @method googleAuth
   * @description
   * Handles Google login requests. Verifies the ID token and issues an application-specific JWT.
   * The JWT is set as an HTTP-only cookie for security.
   * @param {Response} response - The Express response object to set cookies.
   * @param {GoogleLoginDto} googleLoginDto - DTO containing the Google ID token.
   * @returns {Promise<void>} Sends a success response; JWT is in the cookie.
   */
  @Post('google/login')
  @HttpCode(HttpStatus.OK)
  async googleAuth(
    @Res() response: Response,
    @Body() googleLoginDto: GoogleLoginDto,
  ) {
    const result = await this.googleAuthService.verifyTokenAndAuthorize(
      googleLoginDto.token,
    );

    // Set cookie with the JWT access token
    const options = this.cookieOptionsService.getAuthCookieOptions();
    response.cookie('auth_token', result.accessToken, options);

    // Return response without the token in the body for enhanced security
    response.json({
      success: true,
      // The token is transmitted via HTTP-only cookie.
    });
  }

  /**
   * @method logout
   * @description
   * Handles user logout requests. Clears the authentication cookie.
   * @param {Response} response - The Express response object to clear cookies.
   * @returns {void} Sends a success response.
   */
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(@Res() response: Response) {
    const options = this.cookieOptionsService.getSecureCookieOptions();
    response.clearCookie('auth_token', options); // Clears the 'auth_token' cookie.

    response.json({
      success: true,
      message: 'Logged out successfully',
    });
  }
}
