import { Module } from '@nestjs/common';
import { EstimatorModule } from './estimator/estimator.module';
import { HttpModule } from '@nestjs/axios';
import { CatalogModule } from './catalog/catalog.module';

@Module({
  // eslint-disable-next-line prettier/prettier
  imports: [
    HttpModule,
    EstimatorModule,
    CatalogModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
