import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  override canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  override handleRequest<TUser = unknown>(err: unknown, user: TUser): TUser {
    if (err) {
      if (err instanceof Error) {
        throw err;
      }
      throw new UnauthorizedException(
        typeof err === 'string' ? err : 'Authentication error',
      );
    }
    if (!user) {
      throw new UnauthorizedException(
        'Authentication token is missing or invalid',
      );
    }
    return user;
  }
}
