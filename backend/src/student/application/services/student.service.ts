import { Inject, Injectable } from "@nestjs/common";
import {
  FindAllStudentsOptions,
  IUserRepository,
} from "src/users/domain/repositories/iuser.repository";
import { UserMapper } from "src/users/application/mappers/user.mapper";
import { PaginatedUsersDto } from "src/users/application/dto/paginated-users.dto";

@Injectable()
export class StudentService {
  constructor(
    @Inject(IUserRepository) private readonly userRepository: IUserRepository,
    private readonly userMapper: UserMapper,
  ) {}

  async findAll(options: FindAllStudentsOptions): Promise<PaginatedUsersDto> {
    const paginatedResult = await this.userRepository.findAllStudents(options);
    const dtos = paginatedResult.data.map((user) =>
      this.userMapper.toDto(user),
    );
    return {
      data: dtos,
      total: paginatedResult.total,
    };
  }
}
