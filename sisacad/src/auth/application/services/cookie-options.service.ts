import { Injectable } from '@nestjs/common';

/**
 * @class CookieOptionsService
 * @description
 * Service responsible for providing dynamic cookie options based on the current environment (production or development).
 * It configures security and behavior settings for HTTP cookies used by the application.
 */
@Injectable()
export class CookieOptionsService {
  /**
   * @method getAuthCookieOptions
   * @description
   * Returns cookie options specifically tailored for authentication tokens.
   * Settings vary based on whether the application is in a production or development environment.
   * @returns {object} An object containing cookie options.
   */
  getAuthCookieOptions(): object {
    const isProduction = process.env.NODE_ENV === 'production';

    if (isProduction) {
      return {
        httpOnly: true, // Prevents client-side JavaScript from accessing the cookie.
        secure: true, // Ensures the cookie is sent only over HTTPS.
        maxAge: 24 * 60 * 60 * 1000, // Cookie expiration set to 24 hours.
        sameSite: 'None' as const, // Allows cross-site requests, necessary for separate frontend/backend domains.
        path: '/', // The path for which the cookie is valid.
        partitioned: true, // Indicates the cookie is partitioned, used in cross-site contexts (CHIPS).
      };
    } else {
      // For development, allows HTTP (insecure) connection, typically used with a proxy.
      return {
        httpOnly: true,
        secure: false, // Allows cookie to be sent over HTTP in development.
        maxAge: 24 * 60 * 60 * 1000, // Cookie expiration set to 24 hours.
        sameSite: 'Lax' as const, // Allows sending the cookie with top-level navigations and POST requests from other sites.
        path: '/', // The path for which the cookie is valid.
      };
    }
  }

  /**
   * @method getSecureCookieOptions
   * @description
   * Returns generic secure cookie options.
   * Settings vary based on whether the application is in a production or development environment.
   * @returns {object} An object containing cookie options.
   */
  getSecureCookieOptions(): object {
    const isProduction = process.env.NODE_ENV === 'production';

    if (isProduction) {
      return {
        httpOnly: true, // Prevents client-side JavaScript from accessing the cookie.
        secure: true, // Ensures the cookie is sent only over HTTPS.
        sameSite: 'strict' as const, // Restricts cookie to same-site requests to enhance security.
        path: '/', // The path for which the cookie is valid.
      };
    } else {
      return {
        httpOnly: true,
        secure: false, // Allows cookie to be sent over HTTP in development.
        sameSite: 'Lax' as const, // Allows sending the cookie with top-level navigations and POST requests from other sites.
        path: '/', // The path for which the cookie is valid.
      };
    }
  }
}
