import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
  Inject,
} from '@nestjs/common';

import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { OAuth2Client } from 'google-auth-library';
import { IUserRepository } from 'src/users/infrastructure/iuser.repository';
import { JwtPayload } from '../interface/jwt-payload.interface';

@Injectable()
export class GoogleAuthService {
  private readonly client: OAuth2Client;
  private readonly audience: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    @Inject(IUserRepository)
    private readonly userRepository: IUserRepository,
  ) {
    this.audience = this.configService.get('GOOGLE_CLIENT_ID') || 'none';
    this.client = new OAuth2Client(this.audience);
  }

  async verifyTokenAndAuthorize(
    idToken: string,
  ): Promise<{ accessToken: string }> {
    const ticket = await this.client.verifyIdToken({
      idToken,
      audience: this.audience,
    });
    const payload = ticket.getPayload();

    if (!payload || !payload.email) {
      throw new UnauthorizedException('Invalid Google token');
    }

    const user = await this.userRepository.findByEmail(payload.email);

    if (!user) {
      throw new UnauthorizedException(
        `Email ${payload.email} is not registered in the system.`,
      );
    }

    if (!user.isActive) {
      throw new ForbiddenException(
        'User account is inactive. Please contact an administrator.',
      );
    }

    if (!user.googleId) {
      user.linkGoogleProvider(payload.sub);
      await this.userRepository.save(user);
    }

    const jwtPayload: JwtPayload = { sub: user.id, email: user.email };
    const accessToken = this.jwtService.sign(jwtPayload);

    return { accessToken };
  }
}
