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
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Memory Arena - Player ${playerNumber}</title>
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&family=Plus+Jakarta+Sans:wght@500;700;800&display=swap" rel="stylesheet">
          <style>
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body {
              font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
              background: linear-gradient(135deg, #38bdf8 0%, #3b82f6 50%, #fb923c 100%);
              padding: 20px;
            }
            .card {
              background: #ffffff;
              border-radius: 32px;
              padding: 44px 28px;
              max-width: 380px;
              width: 100%;
              box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
              border: 4px solid #bae6fd;
              text-align: center;
              animation: zoomIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
            }
            @keyframes zoomIn {
              from { opacity: 0; transform: scale(0.9); }
              to { opacity: 1; transform: scale(1); }
            }
            .title {
              font-family: 'Orbitron', sans-serif;
              font-size: 34px;
              font-weight: 900;
              color: #0f172a;
              letter-spacing: -0.5px;
            }
            .subtitle {
              font-size: 17px;
              font-weight: 600;
              color: #64748b;
              margin-top: 6px;
              margin-bottom: 32px;
            }
            .check-icon {
              width: 88px;
              height: 88px;
              border-radius: 50%;
              border: 5px solid #22c55e;
              background: #ffffff;
              display: flex;
              align-items: center;
              justify-content: center;
              margin: 0 auto 28px;
            }
            .check-icon svg {
              width: 48px;
              height: 48px;
              color: #22c55e;
            }
            .avatar-wrapper {
              position: relative;
              width: 96px;
              height: 96px;
              margin: 0 auto 20px;
            }
            .avatar {
              width: 96px;
              height: 96px;
              border-radius: 50%;
              border: 4px solid #22c55e;
              object-fit: cover;
              box-shadow: 0 10px 25px rgba(34, 197, 94, 0.3);
            }
            .check-badge {
              position: absolute;
              bottom: -2px;
              right: -2px;
              width: 32px;
              height: 32px;
              background: #22c55e;
              border: 3px solid #ffffff;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .player-name {
              font-size: 20px;
              font-weight: 700;
              color: #0284c7;
              margin-bottom: 16px;
            }
            .ready-heading {
              font-family: 'Orbitron', sans-serif;
              font-size: 26px;
              font-weight: 900;
              color: #0f172a;
              margin-bottom: 8px;
            }
            .subtext {
              font-size: 17px;
              font-weight: 600;
              color: #475569;
              line-height: 1.5;
            }
          </style>
        </head>
        <body>
          <div class="card">
            <h1 class="title">Player ${playerNumber}</h1>
            <div class="subtitle">Mobile Authentication</div>
            
            ${authResult.player.pictureUrl ? `
              <div class="avatar-wrapper">
                <img src="${authResult.player.pictureUrl}" alt="${authResult.player.displayName}" class="avatar" />
                <div class="check-badge">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </div>
              </div>
              <div class="player-name">${authResult.player.displayName}</div>
            ` : `
              <div class="check-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              </div>
            `}

            <div class="ready-heading">You are Ready!</div>
            <div class="subtext">Please look at the main screen.</div>
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
