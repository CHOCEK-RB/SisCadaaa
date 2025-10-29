import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { JwtPayload } from 'src/auth/interface/jwt-payload.interface';

interface RequestWithUser extends Request {
  user: JwtPayload;
}

export const GetUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): JwtPayload => {
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();

    const user = request.user;

    if (!user) {
      console.error(
        'GetUser decorator called on a request without a user object. Ensure AuthGuard ran successfully.',
      );
      return null as unknown as JwtPayload;
    }

    return user;
  },
);
