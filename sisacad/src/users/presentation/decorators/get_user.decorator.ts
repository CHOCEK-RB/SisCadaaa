import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

interface AuthenticatedUserPayload {
  id: string;
  email: string;
  pictureUrl?: string;
  isActive: boolean;
}

interface RequestWithUser extends Request {
  user: AuthenticatedUserPayload;
}

export const GetUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthenticatedUserPayload => {
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();

    const user = request.user;

    if (!user) {
      console.error(
        'GetUser decorator called on a request without a user object. Ensure AuthGuard ran successfully.',
      );
      return null as unknown as AuthenticatedUserPayload;
    }

    return user;
  },
);
