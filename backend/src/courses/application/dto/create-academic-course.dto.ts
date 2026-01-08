import { IsUUID, IsOptional, IsNotEmpty } from 'class-validator';

export class CreateAcademicCourseDTO {
  @IsUUID()
  @IsNotEmpty()
  courseId: string;

  @IsUUID()
  @IsOptional()
  coordinatorId?: string;

  @IsUUID()
  @IsNotEmpty()
  academicPeriodId: string;
}
