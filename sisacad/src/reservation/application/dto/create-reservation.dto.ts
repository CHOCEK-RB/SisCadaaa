import { IsUUID, IsDateString, IsNotEmpty } from 'class-validator';

export class CreateReservationDto {
  @IsNotEmpty({ message: 'El ID del aula es requerido' })
  @IsUUID('4', { message: 'El ID del aula debe ser un UUID válido' })
  classroomId: string;

  @IsNotEmpty({ message: 'La fecha de inicio es requerida' })
  @IsDateString({}, { message: 'La fecha de inicio debe ser una fecha válida' })
  startTime: string;

  @IsNotEmpty({ message: 'La fecha de fin es requerida' })
  @IsDateString({}, { message: 'La fecha de fin debe ser una fecha válida' })
  endTime: string;
}
