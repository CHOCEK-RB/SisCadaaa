import { Injectable } from '@nestjs/common';

/**
 * @class AppService
 * @description
 * Provides core application services and business logic.
 * Currently, it offers a basic greeting message.
 */
@Injectable()
export class AppService {
  /**
   * @constructor
   * @description
   * Initializes the AppService.
   */
  constructor() {}

  getHello(): string {
    return 'Hello World!';
  }
}
