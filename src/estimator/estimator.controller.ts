/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Body, Controller, Post } from '@nestjs/common';
import { EstimatorService } from './estimator.service';
import { EstimateRequestDto } from './dto/estimate.request.dto';
import { EstimateResponseDto } from './dto/estimate.response.dto';

@Controller()
export class EstimatorController {
  constructor(private readonly estimatorService: EstimatorService) {}

  @Post('estimate')
  async estimate(
    @Body() dto: EstimateRequestDto,
  ): Promise<EstimateResponseDto> {
    return await this.estimatorService.estimate(dto);
  }
}
