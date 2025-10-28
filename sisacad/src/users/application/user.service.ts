import { Inject, Injectable, NotFoundException } from '@nestjs/common';

import { IUserRepository } from '../infrastructure/iuser.repository';

import { User } from '../aggregates/user.entity';
import { PreRegisterUserDto } from './pre-register-user.dto';

import { UserProfileDTO } from './dto/user.dto';
import { StudentProfileDTO } from './dto/student.dto';
import { TeacherProfileDTO } from './dto/teacher.dto';
import { AdminProfileDTO } from './dto/admin.dto';
import { SecretaryProfileDTO } from './dto/secreaty.dto';

export type AnyProfileDTO =
  | StudentProfileDTO
  | TeacherProfileDTO
  | AdminProfileDTO
  | SecretaryProfileDTO
  | UserProfileDTO;

@Injectable()
export class UserService {
  constructor(
    @Inject(IUserRepository) private readonly userRepository: IUserRepository,
  ) {}

  async getUserProfile(userId: string): Promise<UserProfileDTO> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    let profileData: AnyProfileDTO;

    if (user.studentProfile) {
      profileData = {
        id: user.studentProfile.id,
        email: user.email,
        isActive: user.isActive,
        role: 'student',
        firstName: user.studentProfile.name,
        lastName:
          `${user.studentProfile.firstLastName} ${user.studentProfile.secondLastName}`.trim(),
        cui: user.studentProfile.cui,
        semester: user.studentProfile.semester,
      } as StudentProfileDTO;
    } else if (user.teacherProfile) {
      profileData = {
        id: user.teacherProfile.id,
        email: user.email,
        isActive: user.isActive,
        role: 'teacher',
        firstName: user.teacherProfile.name,
        lastName:
          `${user.teacherProfile.firstLastName} ${user.teacherProfile.secondLastName}`.trim(),
      } as TeacherProfileDTO;
    } else if (user.adminProfile) {
      profileData = {
        id: user.adminProfile.id,
        email: user.email,
        isActive: user.isActive,
        role: 'admin',
        firstName: user.adminProfile.name,
        lastName:
          `${user.adminProfile.firstLastName} ${user.adminProfile.secondLastName}`.trim(),
      } as AdminProfileDTO;
    } else if (user.secretaryProfile) {
      profileData = {
        id: user.secretaryProfile.id,
        email: user.email,
        isActive: user.isActive,
        role: 'secretary',
        firstName: user.secretaryProfile.name,
        lastName:
          `${user.secretaryProfile.firstLastName} ${user.secretaryProfile.secondLastName}`.trim(),
      } as SecretaryProfileDTO;
    } else {
      profileData = {
        id: user.id,
        email: user.email,
        isActive: user.isActive,
        role: 'unknown',
        firstName: '',
        lastName: '',
      } as UserProfileDTO;
    }

    return profileData;
  }

  async preRegisterUser(dto: PreRegisterUserDto): Promise<User> {
    return this.userRepository.create(dto.email);
  }

  async activateUser(userId: string): Promise<User> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
    user.activate();
    return this.userRepository.save(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findByEmail(email);
  }
}
