import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { ApiResponse } from 'src/common/responses';
import { AccessTokenGuard } from '../auth/guards';
import { StatsService } from './stats.service';

@ApiTags('Stats')
@Controller({ path: 'stats', version: '1' })
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @UseGuards(AccessTokenGuard)
  @Get()
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Analytics data fetched successfully.' })
  async getAnalytics(): Promise<ApiResponse> {
    const data = await this.statsService.getAnalytics();
    return new ApiResponse(data);
  }
}
