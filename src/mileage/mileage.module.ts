import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MileageHistory } from 'src/entities/mileage-history.entity';
import { Mileage } from 'src/entities/mileage.entity';
import { Review } from 'src/entities/review.entity';
import { MileageController } from './controllers/mileage.controller';
import { MILEAGE_SERVICE } from './domain/mileage.service';
import { MileageProvider } from './mileage.provider';
import { MileageServiceImpl } from './service/mileage.service';

@Module({
  imports: [TypeOrmModule.forFeature([Mileage, MileageHistory, Review])],
  controllers: [MileageController],
  providers: [
    MileageProvider,
    {
      provide: MILEAGE_SERVICE,
      useClass: MileageServiceImpl,
    },
  ],
  exports: [MileageProvider],
})
export class MileageModule {}
