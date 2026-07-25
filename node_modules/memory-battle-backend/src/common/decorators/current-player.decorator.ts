import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { IJwtPayload } from '../interfaces/api-response.interface';

export const CurrentPlayer = createParamDecorator(
  (data: keyof IJwtPayload | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<{ user?: IJwtPayload }>();
    const player = request.user;

    return data && player ? player[data] : player;
  },
);
