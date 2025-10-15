import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { GoogleAuthService } from '../application/google-auth.service';
import { GoogleLoginDto } from '../application/google-login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly googleAuthService: GoogleAuthService) {}

  @Post('google/login')
  @HttpCode(HttpStatus.OK)
  googleAuth(@Body() googleLoginDto: GoogleLoginDto) {
    return this.googleAuthService.verifyTokenAndAuthorize(googleLoginDto.token);
  }
}
