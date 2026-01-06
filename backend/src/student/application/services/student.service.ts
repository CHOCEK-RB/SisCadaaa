import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import {
  FindAllStudentsOptions,
  IUserRepository,
} from "src/users/domain/repositories/iuser.repository";
import { UserMapper } from "src/users/application/mappers/user.mapper";
import { PaginatedUsersDto } from "src/users/application/dto/paginated-users.dto";
import { UpdateStudentDto } from "../dto/update-student.dto";
import { User } from "src/users/domain/aggregates/user.entity";
import { IStudentRepository } from "src/users/domain/repositories/istudent.repository";

@Injectable()
export class StudentService {
  constructor(
    @Inject(IUserRepository) private readonly userRepository: IUserRepository,
    @Inject(IStudentRepository)
    private readonly studentRepository: IStudentRepository,
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

  async update(
    id: string,
    updateStudentDto: UpdateStudentDto,
  ): Promise<User> {
    const user = await this.userRepository.findById(id);
    if (!user || !user.studentProfile) {
      throw new NotFoundException(`Student with id ${id} not found`);
    }

    const {
      email,
      isActive,
      cui,
      name,
      firstLastName,
      secondLastName,
      semester,
    } = updateStudentDto;

    if (email) user.email = email;
    if (isActive !== undefined) user.isActive = isActive;
    if (cui) user.studentProfile.cui = cui;
    if (name) user.studentProfile.name = name;
    if (firstLastName) user.studentProfile.firstLastName = firstLastName;
    if (secondLastName) user.studentProfile.secondLastName = secondLastName;
    if (semester) user.studentProfile.semester = semester;

    return this.userRepository.save(user);
  }

  async remove(id: string): Promise<void> {
    const user = await this.userRepository.findById(id);
    if (!user || !user.studentProfile) {
      throw new NotFoundException(`Student with id ${id} not found`);
    }

    await this.studentRepository.delete(user.studentProfile.id);
    await this.userRepository.delete(id);
  }
}
