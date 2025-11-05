import { Injectable, Inject, ForbiddenException } from '@nestjs/common';

import { IAcademicGroupRepository } from '../infrastructure/iacademic_group.repository';
import { IStudentRepository } from 'src/users/infrastructure/istudent.repository';
import { ITeacherRepository } from 'src/users/infrastructure/iteacher.repository';

import { JwtPayload } from 'src/auth/interface/jwt-payload.interface';
import { AcademicGroupDTO } from './academic_group.dto';

export interface GroupsForPeriods {
  [period: string]: AcademicGroupDTO[];
}

@Injectable()
export class GroupsService {
  constructor(
    @Inject(IAcademicGroupRepository)
    private readonly academicGroupRepository: IAcademicGroupRepository,
    @Inject(IStudentRepository)
    private readonly studentRepository: IStudentRepository,
    @Inject(ITeacherRepository)
    private readonly teacherRepository: ITeacherRepository,
  ) {}

  private getAcademicPeriodLabel(date: Date): string {
    const year = date.getFullYear();
    const month = date.getUTCMonth();

    if (month >= 2 && month < 7) {
      return `${year}-A`;
    } else {
      return `${year}-B`;
    }
  }

  async getAllGroupsForTeacher(authenticatedUser: JwtPayload) {
    if (authenticatedUser.role !== 'teacher') {
      throw new ForbiddenException('Only teachers can access this route');
    }

    const teacherId = await this.teacherRepository.getIdForUserId(
      authenticatedUser.sub,
    );

    if (!teacherId) {
      throw new ForbiddenException('Teacher not found');
    }

    const groups =
      await this.academicGroupRepository.findByIdTeacher(teacherId);

    if (!groups) {
      throw new ForbiddenException('Groups not found');
    }

    const groupsForPeriods: GroupsForPeriods = {};

    for (const group of groups) {
      const period = this.getAcademicPeriodLabel(
        group.academicCourse.creationDate,
      );

      if (!groupsForPeriods[period]) {
        groupsForPeriods[period] = [];
      }

      const groupDTO: AcademicGroupDTO = {
        id: group.id,
        name: group.name,
        type: group.type,
        course: {
          id: group.academicCourse.id,
          course: {
            id: group.academicCourse.course.id,
            code: group.academicCourse.course.code,
            name: group.academicCourse.course.name,
          },
        },
      };

      groupsForPeriods[period].push(groupDTO);
    }
    return groupsForPeriods;
  }
}
