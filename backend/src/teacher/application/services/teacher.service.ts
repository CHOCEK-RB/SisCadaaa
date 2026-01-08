import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import {
  FindAllTeachersOptions,
  IUserRepository,
} from "src/users/domain/repositories/iuser.repository";
import {
  AnyProfileDTO,
  UserMapper,
} from "src/users/application/mappers/user.mapper";
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
  async findOne(id: string): Promise<AnyProfileDTO> {
    let user = await this.userRepository.findById(id);
    if (!user || !user.teacherProfile) {
      const teacher = await this.teacherRepository.findById(id);
      if (teacher && teacher.user) {
        user = await this.userRepository.findById(teacher.user.id);
      }
    }
    if (!user || !user.teacherProfile) {
      throw new NotFoundException(`El profesor con id: ${id} no fue econtrado`);
    }
    return this.userMapper.toDto(user);
  }
  async update(id: string, updateTeacherDto: UpdateTeacherDto): Promise<User> {
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
