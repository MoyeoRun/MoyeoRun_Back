import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { User } from 'src/auth/decorators/auth.decorator';
import { DeserializeAccessToken } from 'src/auth/dto/auth.dto';
import { JwtAccessAuthGuard } from 'src/auth/guards/access-jwt-auth.guard';
import { RunningRequest } from '../dto/running.dto';
import {
  SingleRunningResponse,
  SingleRunningStartRequest,
} from '../dto/single-running.dto';
import { SingleRunningService } from '../services/single-running.service';

@Controller('running')
export class RunningController {
  constructor(private readonly singleRunningService: SingleRunningService) {}

  @UseGuards(JwtAccessAuthGuard)
  @Post('single')
  runStart(
    @User() user: DeserializeAccessToken,
    @Body() body: SingleRunningStartRequest,
  ): Promise<SingleRunningResponse> {
    return this.singleRunningService.runStart(user, body);
  }

  @UseGuards(JwtAccessAuthGuard)
  @Post()
  running(@Body() body: RunningRequest): Promise<SingleRunningResponse> {
    return this.singleRunningService.running(body);
  }

  @UseGuards(JwtAccessAuthGuard)
  @Patch(':id')
  runEnd(@Param('id') id: string): Promise<SingleRunningResponse> {
    return this.singleRunningService.runEnd(id);
  }

  @UseGuards(JwtAccessAuthGuard)
  @Get('list')
  getList(
    @User() user: DeserializeAccessToken,
  ): Promise<SingleRunningResponse[]> {
    return this.singleRunningService.getList(user);
  }

  @UseGuards(JwtAccessAuthGuard)
  @Get(':id')
  getRunning(@Param('id') id: string): Promise<SingleRunningResponse> {
    return this.singleRunningService.getRunning(id);
  }
}
