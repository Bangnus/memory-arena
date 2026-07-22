import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PrismaService } from '../../database/prisma/prisma.service';

@ApiTags('System Health')
@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @ApiOperation({
    summary: 'System Health Check',
    description: 'Returns system metrics, uptime, database connectivity status',
  })
  async checkHealth() {
    let dbStatus = 'DOWN';
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      dbStatus = 'UP';
    } catch {
      dbStatus = 'DOWN';
    }

    const memoryUsage = process.memoryUsage();

    return {
      status: dbStatus === 'UP' ? 'OK' : 'DEGRADED',
      database: dbStatus,
      uptimeSeconds: Math.floor(process.uptime()),
      memory: {
        rssMb: Math.round((memoryUsage.rss / 1024 / 1024) * 100) / 100,
        heapTotalMb:
          Math.round((memoryUsage.heapTotal / 1024 / 1024) * 100) / 100,
        heapUsedMb:
          Math.round((memoryUsage.heapUsed / 1024 / 1024) * 100) / 100,
      },
      version: '1.0.0',
    };
  }
}
