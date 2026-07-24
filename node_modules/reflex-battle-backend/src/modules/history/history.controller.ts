import { Controller, Get, Query, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { HistoryService } from './history.service';

@ApiTags('History')
@Controller('history')
export class HistoryController {
  constructor(private readonly historyService: HistoryService) {}

  @Get()
  @ApiOperation({
    summary: 'Get match history',
    description:
      'Returns paginated match history with rounds and player details',
  })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  async getHistory(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = parseInt(page || '1', 10);
    const limitNum = parseInt(limit || '10', 10);

    return this.historyService.getMatchHistory(pageNum, limitNum);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get single match details',
    description: 'Returns full match information by match ID',
  })
  async getMatchById(@Param('id') id: string) {
    return this.historyService.getMatchById(id);
  }
}
