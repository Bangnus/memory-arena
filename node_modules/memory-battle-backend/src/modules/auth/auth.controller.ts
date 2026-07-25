import { Controller, Post, Get, Body, UseGuards, Query, Res, Logger } from '@nestjs/common';
import type { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LineLoginDto } from './dto/line-login.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentPlayer } from '../../common/decorators/current-player.decorator';
import type { IJwtPayload } from '../../common/interfaces/api-response.interface';

import { SessionService } from '../session/session.service';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
    private readonly sessionService: SessionService,
  ) {}

  @Post('line')
  @ApiOperation({
    summary: 'Login with LINE OAuth Code',
    description:
      'Exchanges LINE authorization code for JWT token and player profile',
  })
  @ApiResponse({ status: 200, description: 'Authentication successful' })
  @ApiResponse({ status: 401, description: 'Invalid LINE authorization code' })
  async loginWithLine(@Body() dto: LineLoginDto) {
    return this.authService.loginWithLine(dto);
  }

  @Get('line/callback')
  @ApiOperation({
    summary: 'LINE OAuth Callback Redirect',
    description: 'Handles GET redirect from LINE and registers player directly',
  })
  async lineCallback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Query('error') error: string,
    @Res() res: Response,
  ) {
    if (error || !code) {
      return res.status(400).send(`
        <!DOCTYPE html>
        <html>
        <head><meta name="viewport" content="width=device-width, initial-scale=1"><title>Login Canceled</title></head>
        <body style="font-family: sans-serif; text-align: center; padding: 40px; background: #0f172a; color: white;">
          <h2 style="color: #ef4444;">Login Canceled</h2>
          <p>${error || 'No authorization code provided'}</p>
        </body>
        </html>
      `);
    }

    try {
      const callbackUrl = this.configService.get<string>('line.callbackUrl')
        || `${this.configService.get<string>('NGROK_URL')}/api/v1/auth/line/callback`;

      const authResult = await this.authService.loginWithLine({
        code,
        redirectUri: callbackUrl,
      });

      let playerNumber = 1;
      if (state && (state.includes('role_2') || state.includes('2'))) {
        playerNumber = 2;
      }

      await this.sessionService.joinPlayer(authResult.player.id, { playerNumber });

      return res.send(`
        <!DOCTYPE html>
        <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>Joined Memory Arena!</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; text-align: center; background: #090d16; color: white; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; padding: 20px; box-sizing: border-box; }
            .card { background: #1e293b; border: 2px solid #38bdf8; border-radius: 24px; padding: 32px; max-width: 360px; width: 100%; box-shadow: 0 0 40px rgba(56,189,248,0.3); margin: auto; }
            .avatar { width: 80px; height: 80px; border-radius: 50%; margin: 0 auto 16px; border: 3px solid #38bdf8; object-fit: cover; }
            .badge { display: inline-block; background: #0284c7; color: white; font-weight: bold; padding: 6px 16px; border-radius: 20px; font-size: 14px; margin-bottom: 12px; }
            h1 { font-size: 24px; margin: 8px 0; }
            p { color: #94a3b8; font-size: 15px; margin: 4px 0 0; }
          </style>
        </head>
        <body>
          <div class="card">
            ${authResult.player.pictureUrl ? `<img src="${authResult.player.pictureUrl}" class="avatar" />` : ''}
            <div class="badge">PLAYER ${playerNumber} READY</div>
            <h1>${authResult.player.displayName}</h1>
            <p>You have joined the Memory Arena match. Look at the arena display screen!</p>
          </div>
        </body>
        </html>
      `);
    } catch (err: any) {
      this.logger.error('LINE callback handling failed', err);
      return res.status(500).send(`
        <!DOCTYPE html>
        <html>
        <head><meta name="viewport" content="width=device-width, initial-scale=1"><title>Login Error</title></head>
        <body style="font-family: sans-serif; text-align: center; padding: 40px; background: #0f172a; color: white;">
          <h2 style="color: #ef4444;">Login Error</h2>
          <p>${err?.message || 'Failed to authenticate with LINE'}</p>
        </body>
        </html>
      `);
    }
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get current authenticated player',
    description: 'Returns player details for current JWT session',
  })
  @ApiResponse({
    status: 200,
    description: 'Player profile returned successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getMe(@CurrentPlayer() player: IJwtPayload) {
    return this.authService.getMe(player.sub);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Logout player session',
    description: 'Client side token invalidation acknowledgement',
  })
  logout() {
    return { message: 'Logged out successfully' };
  }
}
