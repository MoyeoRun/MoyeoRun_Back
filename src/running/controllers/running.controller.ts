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
  RunningListRequest,
  RunningListResponse,
  RunningResponse,
} from '../dto/running.dto';
import { SingleRunningRequest } from '../dto/single-running.dto';
import { RunningService } from '../services/running.service';
import { SingleRunningService } from '../services/single-running.service';

@Controller('running')
export class RunningController {
  constructor(
    private readonly singleRunningService: SingleRunningService,
    private readonly runningService: RunningService,
  ) {}

  @UseGuards(JwtAccessAuthGuard)
  @Post('single')
  runStart(
    @User() user: DeserializeAccessToken,
    @Body() body: SingleRunningRequest,
  ): Promise<RunningResponse> {
    return this.singleRunningService.runStart(user, body);
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
