import { Controller, Post, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { AdminService } from './admin.service';

@ApiTags('Admin')
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('reset')
  @ApiOperation({
    summary: 'Admin Reset System',
    description:
      'Resets active game sessions while preserving match history, players, and leaderboard.',
  })
  async resetSystem() {
    return this.adminService.resetSystem();
  }

  @Post('reset-db')
  @ApiOperation({
    summary: 'Admin Hard Reset Database',
    description:
      'Purges all player records, matches, rounds, sessions, and leaderboard data.',
  })
  async resetDatabase() {
    return this.adminService.resetDatabase();
  }

  @Post('export')
  @ApiOperation({
    summary: 'Export Match History Data',
    description: 'Exports all match records in JSON or CSV format',
  })
  @ApiQuery({ name: 'format', enum: ['json', 'csv'], required: false })
  async exportData(@Query('format') format?: 'json' | 'csv') {
    return this.adminService.exportData(format || 'json');
  }

  @Get('dashboard')
  @ApiOperation({
    summary: 'Get Admin Dashboard Summary',
    description: 'Returns system stats, counts, and active session status',
  })
  async getDashboard() {
    return this.adminService.getDashboardMetrics();
  }
}
