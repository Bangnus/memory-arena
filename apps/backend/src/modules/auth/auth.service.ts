import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { PrismaService } from '../../database/prisma/prisma.service';
import { LineLoginDto } from './dto/line-login.dto';
import { IJwtPayload } from '../../common/interfaces/api-response.interface';

interface ILineTokenResponse {
  access_token: string;
}

interface ILineProfileResponse {
  userId: string;
  displayName: string;
  pictureUrl?: string;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async loginWithLine(dto: LineLoginDto) {
    let lineProfile: {
      userId: string;
      displayName: string;
      pictureUrl?: string;
    };

    const channelId = this.configService.get<string>('line.channelId');
    const channelSecret = this.configService.get<string>('line.channelSecret');
    const callbackUrl = this.configService.get<string>('line.callbackUrl');

    if (dto.code.startsWith('mock_') || channelId === 'dummy-channel-id') {
      // Mock mode for local development or testing
      this.logger.warn(
        `Using mock LINE authentication mode for code: ${dto.code}`,
      );
      const mockId = dto.code.replace('mock_', '') || 'player_1';
      lineProfile = {
        userId: `line_user_${mockId}`,
        displayName: `Player ${mockId.toUpperCase()}`,
        pictureUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${mockId}`,
      };
    } else {
      try {
        // Exchange code for LINE Access Token
        const tokenResponse = await axios.post<ILineTokenResponse>(
          'https://api.line.me/oauth2/v2.1/token',
          new URLSearchParams({
            grant_type: 'authorization_code',
            code: dto.code,
            redirect_uri: callbackUrl || '',
            client_id: channelId || '',
            client_secret: channelSecret || '',
          }).toString(),
          {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          },
        );

        const accessToken = tokenResponse.data.access_token;

        // Fetch user profile from LINE API
        const profileResponse = await axios.get<ILineProfileResponse>(
          'https://api.line.me/v2/profile',
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          },
        );

        lineProfile = {
          userId: profileResponse.data.userId,
          displayName: profileResponse.data.displayName,
          pictureUrl: profileResponse.data.pictureUrl,
        };
      } catch (error) {
        this.logger.error(`LINE OAuth error: ${(error as Error).message}`);
        throw new UnauthorizedException(
          'Failed to authenticate with LINE Provider',
        );
      }
    }

    // Upsert player in database
    const player = await this.prisma.player.upsert({
      where: { lineUserId: lineProfile.userId },
      update: {
        displayName: lineProfile.displayName,
        pictureUrl: lineProfile.pictureUrl,
      },
      create: {
        lineUserId: lineProfile.userId,
        displayName: lineProfile.displayName,
        pictureUrl: lineProfile.pictureUrl,
      },
    });

    const payload: IJwtPayload = {
      sub: player.id,
      lineUserId: player.lineUserId,
      displayName: player.displayName,
    };

    const token = this.jwtService.sign(payload);

    return {
      token,
      player,
    };
  }

  async getMe(playerId: string) {
    const player = await this.prisma.player.findUnique({
      where: { id: playerId },
    });

    if (!player) {
      throw new UnauthorizedException('Player profile not found');
    }

    return player;
  }
}
