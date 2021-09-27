import { BadRequestException, Injectable } from '@nestjs/common';
import { DeserializeAccessToken } from 'src/auth/dto/auth.dto';
import {
  SingleRunningResponseDto,
  SingleRunningStartRequestDto,
} from '../dto/single-running.dto';
import { RunningRespository } from '../running.repository';

@Injectable()
export class SingleRunningService {
  constructor(private readonly runningRepository: RunningRespository) {}

  async runStart(
    user: DeserializeAccessToken,
    body: SingleRunningStartRequestDto,
  ): Promise<SingleRunningResponseDto> {
    try {
      const result = await this.runningRepository.create('single', user, {
        currentDistance: 0,
        currentPace: 0,
        ...body,
      });

      return result.responseData;
    } catch (err) {
      console.error(err);
      throw new BadRequestException('BadRequest');
    }
  }
}
