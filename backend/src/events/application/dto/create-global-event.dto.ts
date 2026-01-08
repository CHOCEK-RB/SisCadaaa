import { IsString, IsEnum, IsDateString, IsBoolean, IsNotEmpty } from 'class-validator';
import { EventType } from '../../domain/aggregates/global_event.entity';

export class CreateGlobalEventDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(EventType)
  @IsNotEmpty()
  type: EventType;

  @IsDateString()
  @IsNotEmpty()
  startDate: Date;

  @IsDateString()
  @IsNotEmpty()
  endDate: Date;

  @IsBoolean()
  @IsNotEmpty()
  isActive: boolean;
}
