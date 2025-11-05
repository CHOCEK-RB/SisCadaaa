import {
  Injectable,
  Inject,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

import { IAcademicGroupRepository } from '../infrastructure/iacademic_group.repository';
import { IStudentRepository } from 'src/users/infrastructure/istudent.repository';
import { ITeacherRepository } from 'src/users/infrastructure/iteacher.repository';
import { IEnrollmentRepository } from 'src/enrollment/infrastructure/ienrollment.repository';

import { JwtPayload } from 'src/auth/interface/jwt-payload.interface';
import { AcademicGroupDTO } from './academic_group.dto';
import { AcademicCourseDTO } from 'src/courses/application/dto/academic_course.dto';
import {
  Enrollment,
  Grades,
} from 'src/enrollment/aggregates/enrollment.entity';
import { GroupType } from '../aggregates/academic_group.entity';
import { ScheduleSlotDTO } from './schedule.dto';

export interface GroupsForPeriods {
  [period: string]: AcademicGroupDTO[];
}

export interface StudentGradeInfo {
  enrollmentId: string;
  studentId: string;
  cui: string;
  firstName: string;
  lastName: string;
  grades: Grades;
}

export interface GroupGradesResponse {
  groupId: string;
  groupName: string;
  groupType: GroupType;
  courseName: string;
  courseCode: string;
  canEdit: boolean;
  students: StudentGradeInfo[];
  gradingScheme: {
    firstContinue: number;
    secondContinue: number;
    thirdContinue: number;
    firstPartial: number;
    secondPartial: number;
    thirdPartial: number;
  };
}

export interface UpdateGradeDto {
  enrollmentId: string;
  grades: Partial<Grades>;
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
    @Inject(IEnrollmentRepository)
    private readonly enrollmentRepository: IEnrollmentRepository,
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

  async getGroupGrades(
    groupId: string,
    authenticatedUser: JwtPayload,
  ): Promise<GroupGradesResponse> {
    if (authenticatedUser.role !== 'teacher') {
      throw new ForbiddenException('Only teachers can access group grades.');
    }

    const teacherProfile = await this.teacherRepository.findByUserId(
      authenticatedUser.sub,
    );
    if (!teacherProfile) {
      throw new NotFoundException('Teacher profile not found.');
    }

    console.log(teacherProfile);

    const group = await this.academicGroupRepository.findById(groupId);
    if (!group) {
      throw new NotFoundException(`Group with ID ${groupId} not found.`);
    }

    console.log(group);

    if (!group.teacher || group.teacher.id !== teacherProfile.id) {
      throw new ForbiddenException('You are not assigned to teach this group.');
    }

    const allEnrollments = group.enrollments;

    const students: StudentGradeInfo[] = allEnrollments.map((enrollment) => ({
      enrollmentId: enrollment.id,
      studentId: enrollment.student.id,
      cui: enrollment.student.cui,
      firstName: enrollment.student.name,
      lastName:
        `${enrollment.student.firstLastName} ${enrollment.student.secondLastName}`.trim(),
      grades: enrollment.grades || {
        firstContinue: -1,
        secondContinue: -1,
        thirdContinue: -1,
        firstPartial: -1,
        secondPartial: -1,
        thirdPartial: -1,
      },
    }));

    students.sort((a, b) => a.lastName.localeCompare(b.lastName));

    return {
      groupId: group.id,
      groupName: group.name,
      groupType: group.type,
      courseName: group.academicCourse.course.name,
      courseCode: group.academicCourse.course.code,
      canEdit: group.type === GroupType.THEORY,
      students,
      gradingScheme: group.academicCourse.grades || {
        firstContinue: 0,
        secondContinue: 0,
        thirdContinue: 0,
        firstPartial: 0,
        secondPartial: 0,
        thirdPartial: 0,
      },
    };
  }

  async updateStudentGrades(
    groupId: string,
    updateGradeDto: UpdateGradeDto,
    authenticatedUser: JwtPayload,
  ): Promise<void> {
    if (authenticatedUser.role !== 'teacher') {
      throw new ForbiddenException('Only teachers can update grades.');
    }

    const teacherProfile = await this.teacherRepository.findByUserId(
      authenticatedUser.sub,
    );
    if (!teacherProfile) {
      throw new NotFoundException('Teacher profile not found.');
    }

    const group = await this.academicGroupRepository.findById(groupId);
    if (!group) {
      throw new NotFoundException(`Group with ID ${groupId} not found.`);
    }

    if (!group.teacher || group.teacher.id !== teacherProfile.id) {
      throw new ForbiddenException('You are not assigned to teach this group.');
    }

    if (group.type !== GroupType.THEORY) {
      throw new BadRequestException(
        'Grades can only be edited for theory groups.',
      );
    }

    const enrollment = await this.enrollmentRepository.findById(
      updateGradeDto.enrollmentId,
    );
    if (!enrollment) {
      throw new NotFoundException(
        `Enrollment with ID ${updateGradeDto.enrollmentId} not found.`,
      );
    }

    const validateGrade = (grade: number | undefined): boolean => {
      if (grade === undefined) return true;
      return grade === -1 || (grade >= 0 && grade <= 20);
    };

    const grades = updateGradeDto.grades;
    if (
      !validateGrade(grades.firstContinue) ||
      !validateGrade(grades.secondContinue) ||
      !validateGrade(grades.thirdContinue) ||
      !validateGrade(grades.firstPartial) ||
      !validateGrade(grades.secondPartial) ||
      !validateGrade(grades.thirdPartial)
    ) {
      throw new BadRequestException(
        'Grades must be between 0 and 20, or -1 for not set.',
      );
    }

    enrollment.grades = {
      ...enrollment.grades,
      ...updateGradeDto.grades,
    };

    await this.enrollmentRepository.save(enrollment);
  }

  async updateMultipleGrades(
    groupId: string,
    updates: UpdateGradeDto[],
    authenticatedUser: JwtPayload,
  ): Promise<void> {
    if (authenticatedUser.role !== 'teacher') {
      throw new ForbiddenException('Only teachers can update grades.');
    }

    const teacherProfile = await this.teacherRepository.findByUserId(
      authenticatedUser.sub,
    );
    if (!teacherProfile) {
      throw new NotFoundException('Teacher profile not found.');
    }

    const group = await this.academicGroupRepository.findById(groupId);
    if (!group) {
      throw new NotFoundException(`Group with ID ${groupId} not found.`);
    }

    if (!group.teacher || group.teacher.id !== teacherProfile.id) {
      throw new ForbiddenException('You are not assigned to teach this group.');
    }

    if (group.type !== GroupType.THEORY) {
      throw new BadRequestException(
        'Grades can only be edited for theory groups.',
      );
    }

    const enrollmentsToUpdate: Enrollment[] = [];

    for (const update of updates) {
      const enrollment: Enrollment | null =
        await this.enrollmentRepository.findById(update.enrollmentId);
      if (!enrollment) {
        console.warn(
          `Enrollment ${update.enrollmentId} not found, skipping...`,
        );
        continue;
      }

      enrollment.grades = {
        ...enrollment.grades,
        ...update.grades,
      };
      enrollmentsToUpdate.push(enrollment);
    }

    if (enrollmentsToUpdate.length > 0) {
      await this.enrollmentRepository.save(enrollmentsToUpdate);
    }
  }

  async getTeacherSchedule(
    authenticatedUser: JwtPayload,
  ): Promise<AcademicGroupDTO[]> {
    if (authenticatedUser.role !== 'teacher') {
      throw new ForbiddenException('Only teachers can view their schedule.');
    }

    const teacherProfile = await this.teacherRepository.findByUserId(
      authenticatedUser.sub,
    );
    if (!teacherProfile) {
      throw new NotFoundException(
        `Teacher profile not found for user ID ${authenticatedUser.sub}.`,
      );
    }

    const allGroups =
      await this.academicGroupRepository.findWithScheduleByTeacherId(
        teacherProfile.id,
      );

    if (!allGroups || allGroups.length === 0) {
      return [];
    }

    const allPeriods = [
      ...new Set(
        allGroups.map((g) =>
          this.getAcademicPeriodLabel(g.academicCourse.creationDate),
        ),
      ),
    ].sort();

    if (allPeriods.length === 0) {
      return [];
    }

    const latestPeriod = allPeriods[allPeriods.length - 1];

    const groupsWithSchedule = allGroups.filter(
      (g) =>
        this.getAcademicPeriodLabel(g.academicCourse.creationDate) ===
        latestPeriod,
    );

    const groupsMap = new Map<string, AcademicGroupDTO>();

    for (const group of groupsWithSchedule) {
      if (!groupsMap.has(group.id)) {
        const schedules: ScheduleSlotDTO[] = group.schedule.map((schedule) => ({
          id: schedule.id,
          day: schedule.day,
          start: schedule.startTime,
          end: schedule.endTime,
          classroom: {
            id: schedule.classroom.id,
            name: schedule.classroom.name,
            type: schedule.classroom.type,
          },
        }));

        const groupDto: AcademicGroupDTO = {
          id: group.id,
          name: group.name,
          type: group.type,
          course: {
            id: group.academicCourse.id,
            course: {
              id: group.academicCourse.course.id,
              name: group.academicCourse.course.name,
              code: group.academicCourse.course.code,
            },
          },
          teacher: {
            id: teacherProfile.id,
            email: authenticatedUser.email,
            firstName: teacherProfile.name,
            lastName:
              `${teacherProfile.firstLastName} ${teacherProfile.secondLastName}`.trim(),
            role: 'teacher',
          },
          schedule: schedules,
        };

        groupsMap.set(group.id, groupDto);
      }
    }

    return Array.from(groupsMap.values());
  }
}
