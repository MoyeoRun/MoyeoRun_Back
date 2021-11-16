import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { User } from 'src/auth/decorators/auth.decorator';
import { DeserializeAccessToken } from 'src/auth/dto/auth.dto';
import { JwtAccessAuthGuard } from 'src/auth/guards/access-jwt-auth.guard';
import {
  MultiRunningRequest,
  RunningListRequest,
  RunningListResponse,
  RunningRequest,
  RunningResponse,
} from '../dto/running.dto';
import { SingleRunningService } from '../services/multi-running.service';
import { RunningService } from '../services/running.service';

@Controller('running')
export class RunningController {
  constructor(
    private readonly singleRunningService: SingleRunningService,
    private readonly runningService: RunningService,
  ) {}

  @UseGuards(JwtAccessAuthGuard)
  @Post('single')
  singleEnd(
    @User() user: DeserializeAccessToken,
    @Body() body: RunningRequest,
  ): Promise<RunningResponse> {
    return this.runningService.runEnd(user, body);
  }

  @UseGuards(JwtAccessAuthGuard)
  @Post('multi')
  multiEnd(
    @User() user: DeserializeAccessToken,
    @Body() body: MultiRunningRequest,
  ): Promise<RunningResponse> {
    return this.singleRunningService.runEnd(user, body);
  }

  @UseGuards(JwtAccessAuthGuard)
  @Get('list')
  getList(
    @User() user: DeserializeAccessToken,
    @Query() params: RunningListRequest,
  ): Promise<RunningListResponse> {
    return this.runningService.getList(user, params);
  }

  @UseGuards(JwtAccessAuthGuard)
  @Get(':id')
  getRunning(@Param('id') id: string): Promise<RunningResponse> {
    return this.runningService.getRunning(id);
  }
}
