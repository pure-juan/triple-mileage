import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Event } from 'src/entities/event.entity';
import { Photo } from 'src/entities/photo.entity';
import { Review } from 'src/entities/review.entity';
import { MileageModule } from 'src/mileage/mileage.module';
import { EventController } from './controllers/event.controller';
import { EVENT_SERVICE } from './domain/event.service';
import { EventServiceImpl } from './services/event.service';

@Module({
  imports: [TypeOrmModule.forFeature([Event, Review, Photo]), MileageModule],
  controllers: [EventController],
  providers: [
    {
      provide: EVENT_SERVICE,
      useClass: EventServiceImpl,
    },
  ],
})
export class EventModule {}
