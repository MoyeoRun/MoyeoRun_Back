import {
  Body,
  Controller,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { DeserializeAccessToken } from 'src/auth/dto/auth.dto';
import { JwtAccessAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { User } from 'src/user/decorators/user.decorator';
import { RunningRequest } from '../dto/running.dto';
import {
  SingleRunningResponse,
  SingleRunningStartRequest,
} from '../dto/single-running.dto';
import { SingleRunningService } from '../services/single-running.service';

@Controller('single-running')
export class SingleRunningController {
  constructor(private readonly singleRunningService: SingleRunningService) {}

  @UseGuards(JwtAccessAuthGuard)
  @Post()
  runStart(
    @User() user: DeserializeAccessToken,
    @Body() body: SingleRunningStartRequest,
  ): Promise<SingleRunningResponse> {
    return this.singleRunningService.runStart(user, body);
  }

  @UseGuards(JwtAccessAuthGuard)
  @Post('running')
  running(@Body() body: RunningRequest): Promise<SingleRunningResponse> {
    return this.singleRunningService.running(body);
  }

  @UseGuards(JwtAccessAuthGuard)
  @Patch(':id')
  runEnd(@Param('id') id: string): Promise<SingleRunningResponse> {
    return this.singleRunningService.runEnd(id);
  }
}
