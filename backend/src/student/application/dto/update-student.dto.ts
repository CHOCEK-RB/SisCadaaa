import { IsString, IsOptional, IsNumber } from "class-validator";
import { UpdateUserDto } from "src/users/application/dto/update-user.dto";

export class UpdateStudentDto extends UpdateUserDto {
  @IsOptional()
  @IsString()
  cui?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  firstLastName?: string;

  @IsOptional()
  @IsString()
  secondLastName?: string;

  @IsOptional()
  @IsNumber()
  semester?: number;
}
