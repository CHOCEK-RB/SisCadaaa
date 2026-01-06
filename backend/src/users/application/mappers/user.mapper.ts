
import { Injectable } from '@nestjs/common';
import { User } from 'src/users/domain/aggregates/user.entity';
import { AdminProfileDTO } from '../dto/admin.dto';
import { SecretaryProfileDTO } from '../dto/secretary.dto';
import { StudentProfileDTO } from '../dto/student.dto';
import { TeacherProfileDTO } from '../dto/teacher.dto';
import { UserProfileDTO } from '../dto/user.dto';

export type AnyProfileDTO =
  | StudentProfileDTO
  | TeacherProfileDTO
  | AdminProfileDTO
  | SecretaryProfileDTO
  | UserProfileDTO;

@Injectable()
export class UserMapper {
  toDto(user: User): AnyProfileDTO {
    if (user.studentProfile) {
      return {
        id: user.studentProfile.id,
        userId: user.id,
        email: user.email,
        isActive: user.isActive,
        role: 'student',
        firstName: user.studentProfile.name,
        lastName:
          `${user.studentProfile.firstLastName} ${user.studentProfile.secondLastName}`.trim(),
        cui: user.studentProfile.cui,
        semester: user.studentProfile.semester,
      } as StudentProfileDTO;
    }

    if (user.teacherProfile) {
      return {
        id: user.teacherProfile.id,
        userId: user.id,
        email: user.email,
        isActive: user.isActive,
        role: 'teacher',
        firstName: user.teacherProfile.name,
        lastName:
          `${user.teacherProfile.firstLastName} ${user.teacherProfile.secondLastName}`.trim(),
      } as TeacherProfileDTO;
    }

    if (user.adminProfile) {
      return {
        id: user.adminProfile.id,
        userId: user.id,
        email: user.email,
        isActive: user.isActive,
        role: 'admin',
        firstName: user.adminProfile.name,
        lastName:
          `${user.adminProfile.firstLastName} ${user.adminProfile.secondLastName}`.trim(),
      } as AdminProfileDTO;
    }

    if (user.secretaryProfile) {
      return {
        id: user.secretaryProfile.id,
        userId: user.id,
        email: user.email,
        isActive: user.isActive,
        role: 'secretary',
        firstName: user.secretaryProfile.name,
        lastName:
          `${user.secretaryProfile.firstLastName} ${user.secretaryProfile.secondLastName}`.trim(),
      } as SecretaryProfileDTO;
    }

    return {
      id: user.id,
      userId: user.id,
      email: user.email,
      isActive: user.isActive,
      role: 'unknown',
      firstName: '',
      lastName: '',
    } as UserProfileDTO;
  }
}
