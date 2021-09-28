import {
  Body,
  Controller,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { DeserializeAccessToken } from 'src/auth/dto/auth.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { User } from 'src/user/decorators/user.decorator';
import { RunningRequestDto } from '../dto/running.dto';
import {
  SingleRunningResponseDto,
  SingleRunningStartRequestDto,
} from '../dto/single-running.dto';
import { SingleRunningService } from '../services/single-running.service';

@Controller('single-running')
export class SingleRunningController {
  constructor(private readonly singleRunningService: SingleRunningService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  runStart(
    @User() user: DeserializeAccessToken,
    @Body() body: SingleRunningStartRequestDto,
  ): Promise<SingleRunningResponseDto> {
    return this.singleRunningService.runStart(user, body);
  }

  @UseGuards(JwtAuthGuard)
  @Post('running')
  running(@Body() body: RunningRequestDto): Promise<SingleRunningResponseDto> {
    return this.singleRunningService.running(body);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  runEnd(@Param('id') id: string): Promise<SingleRunningResponseDto> {
    return this.singleRunningService.runEnd(id);
  }
}
