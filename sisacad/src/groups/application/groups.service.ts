import { Injectable, Inject, ForbiddenException } from '@nestjs/common';

import { IAcademicGroupRepository } from '../infrastructure/iacademic_group.repository';
import { IStudentRepository } from 'src/users/infrastructure/istudent.repository';
import { ITeacherRepository } from 'src/users/infrastructure/iteacher.repository';

import { JwtPayload } from 'src/auth/interface/jwt-payload.interface';
import { AcademicGroupDTO } from './academic_group.dto';
import { AcademicCourseDTO } from 'src/courses/application/dto/academic_course.dto';

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

  async getAllGroupsForTeacher(
    authenticatedUser: JwtPayload,
  ): Promise<GroupsForPeriods> {
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
            semester: group.academicCourse.course.semester,
            credits: group.academicCourse.course.credits,
          },
        },
      };

      groupsForPeriods[period].push(groupDTO);
    }
    return groupsForPeriods;
  }

  async getAcademicCourse(id: string): Promise<AcademicCourseDTO> {
    const group = await this.academicGroupRepository.getAcademicCourse(id);

    if (!group) {
      throw new ForbiddenException('Group not found');
    }

    const course: AcademicCourseDTO = {
      id: group.academicCourse.id,
      creationDate: group.academicCourse.creationDate,
      urlSyllabus: group.academicCourse.urlSyllabus,
      course: {
        id: group.academicCourse.course.id,
        code: group.academicCourse.course.code,
        name: group.academicCourse.course.name,
        semester: group.academicCourse.course.semester,
        credits: group.academicCourse.course.credits,
      },
      topics: group.academicCourse.topics.map((topic) => ({
        id: topic.id,
        order: topic.topicOrder,
        topic: topic.topic,
      })),
    };

    return course;
  }

  async getSchedule(id: string): Promise<AcademicGroupDTO[]> {
    const group = await this.academicGroupRepository.getScheduleById(id);

    console.log(id);

    if (!group) {
      throw new ForbiddenException('Group not found');
    }

    const groupDTO: AcademicGroupDTO = {
      id: group.id,
      name: group.name,
      type: group.type,
      schedule: group.schedule.map((s) => ({
        id: s.id,
        day: s.day,
        start: s.startTime,
        end: s.endTime,
        classroom: {
          id: s.classroom.id,
          name: s.classroom.name,
          type: s.classroom.type,
        },
      })),
    };

    const groups: AcademicGroupDTO[] = [];

    groups.push(groupDTO);

    return groups;
  }
}
