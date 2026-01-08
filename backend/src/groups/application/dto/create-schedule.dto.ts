import {
  IsUUID,
  IsString,
  IsArray,
  ValidateNested,
  IsEnum,
  Matches,
} from 'class-validator';
import { Type } from 'class-transformer';
import { DayOfWeek } from '../../domain/aggregates/schedule.entity';

export class CreateScheduleSlotDto {
  @IsEnum(DayOfWeek, { message: 'Day must be a valid DayOfWeek enum value' })
  day: DayOfWeek;

  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'Start time must be in HH:MM format (24-hour)',
  })
  startTime: string;

  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'End time must be in HH:MM format (24-hour)',
  })
  endTime: string;
}

export class CreateScheduleDto {
  @IsUUID()
  groupId: string;

  @IsUUID()
  classroomId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateScheduleSlotDto)
  scheduleSlots: CreateScheduleSlotDto[];
}