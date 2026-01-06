import { IsString, IsOptional } from "class-validator";
import { UpdateUserDto } from "src/users/application/dto/update-user.dto";

export class UpdateTeacherDto extends UpdateUserDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  firstLastName?: string;

  @IsOptional()
  @IsString()
  secondLastName?: string;
}
