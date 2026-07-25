import { Controller, Post, Get, Body, UseGuards, Query, Res } from '@nestjs/common';
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

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
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
    description: 'Handles GET redirect from LINE and redirects back to frontend',
  })
  async lineCallback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Query('error') error: string,
    @Res() res: Response,
  ) {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3001';
    
    if (error) {
      return res.redirect(`${frontendUrl}/login?error=${encodeURIComponent(error)}`);
    }
    
    if (!code) {
      return res.redirect(`${frontendUrl}/login?error=NoCode`);
    }

    return res.redirect(`${frontendUrl}/login?code=${encodeURIComponent(code)}&state=${encodeURIComponent(state || '')}`);
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
