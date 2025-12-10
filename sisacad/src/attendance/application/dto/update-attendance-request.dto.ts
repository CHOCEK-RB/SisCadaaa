// 1. IMPORTANTE: Importar los validadores
import { IsNotEmpty, IsObject } from "class-validator";
import { AttendanceStatus } from "../../domain/aggregates/attendance.entity";

export class UpdateAttendanceRequestDto {
  @IsNotEmpty()
  @IsObject()
  studentStatuses: Record<string, AttendanceStatus>;
}
