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
  SingleRunningRequest,
  SingleRunningResponse,
} from '../dto/single-running.dto';
import { SingleRunningService } from '../services/single-running.service';

@Controller('running')
export class RunningController {
  constructor(private readonly singleRunningService: SingleRunningService) {}

  @UseGuards(JwtAccessAuthGuard)
  @Post('single')
  runStart(
    @User() user: DeserializeAccessToken,
    @Body() body: SingleRunningRequest,
  ): Promise<SingleRunningResponse> {
    return this.singleRunningService.runStart(user, body);
  }

  @UseGuards(JwtAccessAuthGuard)
  @Get('list')
  getList(
    @User() user: DeserializeAccessToken,
    @Query() params: RunningListRequest,
  ): Promise<SingleRunningResponse[]> {
    return this.singleRunningService.getList(user, params);
  }

  @UseGuards(JwtAccessAuthGuard)
  @Get(':id')
  getRunning(@Param('id') id: string): Promise<SingleRunningResponse> {
    return this.singleRunningService.getRunning(id);
  }
}
