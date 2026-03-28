import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { LeaderboardService } from './leaderboard.service';

@ApiTags('leaderboard')
@Controller('leaderboard')
export class LeaderboardController {
  constructor(
    private readonly leaderboardService: LeaderboardService,
  ) {}

  @Get()
  async getLeaderboard(
    @Query('type') type: 'global' | 'weekly' = 'global',
  ) {
    return this.leaderboardService.getLeaderboard(type);
  }
}