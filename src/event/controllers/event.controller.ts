import { Body, Controller, Inject, Post } from '@nestjs/common';
import { EventRequestDTO } from '../domain/dto/request.dto';
import { EVENT_SERVICE, IEventService } from '../domain/event.service';

@Controller('event')
export class EventController {
  constructor(
    @Inject(EVENT_SERVICE) private readonly eventService: IEventService,
  ) {}

  @Post()
  async event(@Body() payload: EventRequestDTO) {
    return this.eventService.event(payload);
  }
}
