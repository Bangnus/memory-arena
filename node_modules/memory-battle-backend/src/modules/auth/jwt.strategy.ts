import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { IJwtPayload } from '../../common/interfaces/api-response.interface';
import { PrismaService } from '../../database/prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey:
        configService.get<string>('jwt.secret') ||
        'super-secret-key-memory-arena',
    });
  }

  async validate(payload: IJwtPayload): Promise<IJwtPayload> {
    const player = await this.prisma.player.findUnique({
      where: { id: payload.sub },
    });

    if (!player) {
      throw new UnauthorizedException('Player account not found');
    }

    return {
      sub: player.id,
      lineUserId: player.lineUserId,
      displayName: player.displayName,
    };
  }
}
