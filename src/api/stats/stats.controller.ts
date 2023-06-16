import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiResponse } from 'src/common/responses';
import { AccessTokenGuard } from '../auth/guards';
import { StatsService } from './stats.service';

@Controller({ path: 'stats', version: '1' })
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @UseGuards(AccessTokenGuard)
  @Get()
  async getAnalytics(): Promise<ApiResponse> {
    const data = await this.statsService.getAnalytics();
    return new ApiResponse(data);
  }
}
