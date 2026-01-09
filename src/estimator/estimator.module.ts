import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { EstimatorController } from './estimator.controller';
import { EstimatorService } from './estimator.service';
import { WfmHttpClient } from './wfm/wfm-http.client';

@Module({
  imports: [HttpModule], // ✅ esto habilita HttpService en este módulo
  controllers: [EstimatorController],
  providers: [EstimatorService, WfmHttpClient],
})
export class EstimatorModule {}
