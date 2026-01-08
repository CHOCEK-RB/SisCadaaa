import {
  IsString,
  IsInt,
  Min,
  IsUUID,
  IsOptional,
  IsEnum,
} from "class-validator";
import { GroupType } from "../../domain/aggregates/academic_group.entity";

export class CreateAcademicGroupDto {
  @IsString()
  name: string;

  @IsInt()
  @Min(1)
  capacity: number;

  @IsEnum(GroupType)
  type: GroupType;

  @IsUUID()
  academicCourseId: string;

  @IsOptional()
  @IsUUID()
  teacherId?: string;
}
