import { IsOptional, IsString, IsInt, Min, IsUUID, IsEnum } from 'class-validator';
import { GroupType } from '../../domain/aggregates/academic_group.entity'; // Import GroupType

export class UpdateAcademicGroupDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  capacity?: number;

  @IsOptional()
  @IsUUID()
  teacherId?: string;

  @IsOptional()
  @IsEnum(GroupType, { message: 'Type must be a valid GroupType enum value' })
  type?: GroupType;
}
