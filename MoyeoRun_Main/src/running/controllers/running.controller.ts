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
  MultiRunningListResponse,
  MultiRunningRequest,
  RunningListRequest,
  RunningRequest,
  RunningResponse,
  SingleRunningListResponse,
} from '../dto/running.dto';
import { MultiRunningService } from '../services/multi-running.service';
import { RunningService } from '../services/running.service';

@Controller('running')
export class RunningController {
  constructor(
    private readonly multiRunningService: MultiRunningService,
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
    return this.multiRunningService.runEnd(user, body);
  }

  @UseGuards(JwtAccessAuthGuard)
  @Get('list/single')
  getSingleRunList(
    @User() user: DeserializeAccessToken,
    @Query() params: RunningListRequest,
  ): Promise<SingleRunningListResponse> {
    return this.runningService.getSingleRunList(user, params);
  }

  @UseGuards(JwtAccessAuthGuard)
  @Get('list/multi')
  getMultiRunList(
    @User() user: DeserializeAccessToken,
    @Query() params: RunningListRequest,
  ): Promise<MultiRunningListResponse> {
    return this.runningService.getMultiRunList(user, params);
  }

  @UseGuards(JwtAccessAuthGuard)
  @Get(':id')
  getSingleRunning(@Param('id') id: string): Promise<RunningResponse> {
    return this.runningService.getRunning(id);
  }

  @UseGuards(JwtAccessAuthGuard)
  @Get('multi/:id')
  getMultiRunning(
    @User() user: DeserializeAccessToken,
    @Param('id') id: number,
  ): Promise<any> {
    return this.runningService.getMultiRun(user, id);
  }
}
