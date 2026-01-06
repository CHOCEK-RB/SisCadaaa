import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import {
  FindAllTeachersOptions,
  IUserRepository,
} from "src/users/domain/repositories/iuser.repository";
import { UserMapper } from "src/users/application/mappers/user.mapper";
import { PaginatedUsersDto } from "src/users/application/dto/paginated-users.dto";
import { UpdateTeacherDto } from "../dto/update-teacher.dto";
import { User } from "src/users/domain/aggregates/user.entity";
import { ITeacherRepository } from "src/users/domain/repositories/iteacher.repository";

@Injectable()
export class TeacherService {
  constructor(
    @Inject(IUserRepository) private readonly userRepository: IUserRepository,
    @Inject(ITeacherRepository)
    private readonly teacherRepository: ITeacherRepository,
    private readonly userMapper: UserMapper,
  ) {}

  async findAll(options: FindAllTeachersOptions): Promise<PaginatedUsersDto> {
    const paginatedResult = await this.userRepository.findAllTeachers(options);
    const dtos = paginatedResult.data.map((user) =>
      this.userMapper.toDto(user),
    );
    return {
      data: dtos,
      total: paginatedResult.total,
    };
  }

  async update(
    id: string,
    updateTeacherDto: UpdateTeacherDto,
  ): Promise<User> {
    const user = await this.userRepository.findById(id);
    if (!user || !user.teacherProfile) {
      throw new NotFoundException(`Teacher with id ${id} not found`);
    }

    const { email, isActive, name, firstLastName, secondLastName } =
      updateTeacherDto;

    if (email) user.email = email;
    if (isActive !== undefined) user.isActive = isActive;
    if (name) user.teacherProfile.name = name;
    if (firstLastName) user.teacherProfile.firstLastName = firstLastName;
    if (secondLastName) user.teacherProfile.secondLastName = secondLastName;

    return this.userRepository.save(user);
  }

  async remove(id: string): Promise<void> {
    const user = await this.userRepository.findById(id);
    if (!user || !user.teacherProfile) {
      throw new NotFoundException(`Teacher with id ${id} not found`);
    }

    await this.userRepository.delete(id);
  }
}
