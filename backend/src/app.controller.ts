import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

/**
 * @class AppController
 * @description
 * Default application controller providing a basic root endpoint.
 */
@Controller()
export class AppController {
  /**
   * @constructor
   * @param {AppService} appService - The application service providing core logic.
   */
  constructor(private readonly appService: AppService) {}

  /**
   * @method getHello
   * @description
   * Handles GET requests to the root endpoint and returns a greeting message.
   * @returns {string} A string containing the greeting.
   */
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
