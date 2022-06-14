import { IsArray, IsEnum, IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { EventAction, EventType } from 'src/entities/event.entity';

export class EventRequestDTO {
  @IsNotEmpty()
  @IsString()
  @IsEnum(EventType)
  readonly type: EventType;

  @IsNotEmpty()
  @IsString()
  @IsEnum(EventAction)
  readonly action: EventAction;

  @IsString()
  readonly content: string = '';

  @IsNotEmpty()
  @IsString()
  @IsUUID('4')
  readonly reviewId: string;

  @IsArray()
  @IsNotEmpty({ each: true })
  @IsString({ each: true })
  @IsUUID('4', { each: true })
  readonly attachedPhotoIds: Array<string>;

  @IsNotEmpty()
  @IsString()
  @IsUUID('4')
  readonly userId: string;

  @IsNotEmpty()
  @IsString()
  @IsUUID('4')
  readonly placeId: string;
}
