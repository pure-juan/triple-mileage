import { EventRequestDTO } from './dto/request.dto';
import { EventResponseDTO } from './dto/response.dto';

export interface IEventService {
  event(payload: EventRequestDTO): Promise<EventResponseDTO>;
}

export const EVENT_SERVICE = Symbol('EventService');
