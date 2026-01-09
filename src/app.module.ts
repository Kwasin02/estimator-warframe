import { Module } from '@nestjs/common';
import { EstimatorModule } from './estimator/estimator.module';
import { HttpModule } from '@nestjs/axios';

@Module({
  // eslint-disable-next-line prettier/prettier
  imports: [
    HttpModule,
    EstimatorModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
