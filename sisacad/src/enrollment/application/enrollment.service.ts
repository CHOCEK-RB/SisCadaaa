import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';

import { JwtPayload } from 'src/auth/interface/jwt-payload.interface';

import { IEnrollmentRepository } from '../infrastructure/ienrollment.repository';
import { IStudentRepository } from 'src/users/infrastructure/istudent.repository';
import { IAcademicGroupRepository } from 'src/groups/infrastructure/iacademic_group.repository';

import { EnrollmentDetailDTO } from '../application/dto/enrollment.dto';
import { AcademicCourseDTO } from 'src/courses/application/dto/academic_course.dto';
import { CourseDTO } from 'src/courses/application/dto/course.dto';
import { Enrollment, Grades } from '../aggregates/enrollment.entity';
import { AcademicGroupDTO } from 'src/groups/application/academic_group.dto';
import { ScheduleSlotDTO } from 'src/groups/application/schedule.dto';
import { GradingScheme } from 'src/courses/aggregates/academic_course.entity';
import { GroupType } from 'src/groups/aggregates/academic_group.entity';

import { EntityManager } from 'typeorm';
import { EnrollLabGroupDto } from './dto/enrollment.dto';

export interface GroupedEnrollments {
  [period: string]: EnrollmentDetailDTO[];
}

export interface GradesAndPercent {
  course: AcademicCourseDTO;
  grades: Grades;
  percent: GradingScheme;
}

@Injectable()
export class EnrollmentService {
  constructor(
    @Inject(IEnrollmentRepository)
    private readonly enrollmentRepository: IEnrollmentRepository,
    @Inject(IStudentRepository)
    private readonly studentRepository: IStudentRepository,
    @Inject(IAcademicGroupRepository)
    private readonly academicGroupRepository: IAcademicGroupRepository,
    private readonly entityManager: EntityManager,
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

  async getMyEnrollmentsGroupedByPeriod(
    authenticatedUser: JwtPayload,
  ): Promise<GroupedEnrollments> {
    if (authenticatedUser.role !== 'student') {
      throw new ForbiddenException(
        'Only students can access their enrollments.',
      );
    }

    const studentProfile = await this.studentRepository.findByUserId(
      authenticatedUser.sub,
    );
    if (!studentProfile) {
      throw new NotFoundException(
        `Student profile not found for user ID ${authenticatedUser.sub}.`,
      );
    }
    const enrollments = await this.enrollmentRepository.findByStudentId(
      studentProfile.id,
    );

    const grouped: GroupedEnrollments = {};

    for (const enr of enrollments) {
      if (!enr.course || !enr.course.course || !enr.course.creationDate) {
        console.warn(
          `Skipping enrollment ${enr.id} due to missing course data or creation date.`,
        );
        continue;
      }

      const period = this.getAcademicPeriodLabel(
        new Date(enr.course.creationDate),
      );

      if (!grouped[period]) {
        grouped[period] = [];
      }

      const enrollmentDTO: EnrollmentDetailDTO = {
        id: enr.id,
        date: enr.date,
        grades: enr.grades,
        academicCourse: {
          id: enr.course.id,
          creationDate: new Date(enr.course.creationDate),
          urlSyllabus: enr.course.urlSyllabus,
          course: {
            id: enr.course.course.id,
            name: enr.course.course.name,
            code: enr.course.course.code,
            semester: enr.course.course.semester,
            credits: enr.course.course.credits,
          } as CourseDTO,
          coordinator: enr.course.coordinator
            ? {
                id: enr.course.coordinator.id,
                firstName: enr.course.coordinator.name,
                lastName:
                  `${enr.course.coordinator.firstLastName} ${enr.course.coordinator.secondLastName}`.trim(),
              }
            : undefined,
        } as AcademicCourseDTO,
      };

      grouped[period].push(enrollmentDTO);
    }

    const sortedGrouped: GroupedEnrollments = Object.keys(grouped)
      .sort((a, b) => {
        const [yearA, semesterA] = a.split('-');
        const [yearB, semesterB] = b.split('-');
        if (yearA !== yearB) return parseInt(yearB) - parseInt(yearA);
        return semesterB.localeCompare(semesterA);
      })
      .reduce((acc, key) => {
        acc[key] = grouped[key];
        return acc;
      }, {} as GroupedEnrollments);

    return sortedGrouped;
  }

  async getMyGradesForCourse(
    academicCourseId: string,
    authenticatedUser: JwtPayload,
  ): Promise<Grades | null> {
    if (authenticatedUser.role !== 'student') {
      throw new ForbiddenException('Only students can view their grades.');
    }

    const studentProfile = await this.studentRepository.findByUserId(
      authenticatedUser.sub,
    );
    if (!studentProfile) {
      throw new NotFoundException(
        `Student profile not found for user ID ${authenticatedUser.sub}.`,
      );
    }
    const studentEntityId = studentProfile.id;

    const enrollment = await this.enrollmentRepository.findByStudentAndCourse(
      studentEntityId,
      academicCourseId,
    );

    if (!enrollment) {
      throw new NotFoundException(
        `Enrollment not found for student ${studentEntityId} in course ${academicCourseId}.`,
      );
    }

    return enrollment.grades || null;
  }

  async getMyScheduleForCourse(
    academicCourseId: string,
    authenticatedUser: JwtPayload,
  ): Promise<AcademicGroupDTO[] | null> {
    if (authenticatedUser.role !== 'student') {
      throw new ForbiddenException('Only students can view their schedule.');
    }

    const studentProfile = await this.studentRepository.findByUserId(
      authenticatedUser.sub,
    );
    if (!studentProfile) {
      throw new NotFoundException(
        `Student profile not found for user ID ${authenticatedUser.sub}.`,
      );
    }

    const studentId = studentProfile.id;

    const enrollment =
      await this.enrollmentRepository.findByStudentAndCourse_Schedule(
        studentId,
        academicCourseId,
      );

    if (!enrollment || !enrollment.groups || enrollment.groups.length === 0) {
      throw new NotFoundException(
        `Enrollment or associated groups not found for student ${studentId} in course ${academicCourseId}.`,
      );
    }

    const groups: AcademicGroupDTO[] = [];

    for (const group of enrollment.groups) {
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
        schedule: schedules,
        course: {
          id: group.academicCourse.id,
          course: {
            id: group.academicCourse.course.id,
            name: group.academicCourse.course.name,
            code: group.academicCourse.course.code,
          },
        },
      };

      groups.push(groupDto);
    }

    return groups;
  }

  async getMySchedule(
    authenticatedUser: JwtPayload,
  ): Promise<AcademicGroupDTO[] | null> {
    if (authenticatedUser.role !== 'student') {
      throw new ForbiddenException('Only students can view their schedule.');
    }

    const studentProfile = await this.studentRepository.findByUserId(
      authenticatedUser.sub,
    );
    if (!studentProfile) {
      throw new NotFoundException(
        `Student profile not found for user ID ${authenticatedUser.sub}.`,
      );
    }

    const enrollments: Enrollment[] | null =
      await this.enrollmentRepository.findByStudentIdAndActives(
        studentProfile.id,
      );

    if (!enrollments || enrollments.length === 0) {
      throw new NotFoundException(
        `Enrollment or associated groups not found for student ${studentProfile.id}.`,
      );
    }

    const groups: AcademicGroupDTO[] = [];

    for (const enrollment of enrollments) {
      for (const group of enrollment.groups) {
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
          schedule: schedules,
        };

        groups.push(groupDto);
      }
    }

    return groups;
  }

  async getAllGrades(
    authenticatedUser: JwtPayload,
  ): Promise<GradesAndPercent[]> {
    if (authenticatedUser.role !== 'student') {
      throw new ForbiddenException('Only students can view their schedule.');
    }

    const studentProfile = await this.studentRepository.findByUserId(
      authenticatedUser.sub,
    );
    if (!studentProfile) {
      throw new NotFoundException(
        `Student profile not found for user ID ${authenticatedUser.sub}.`,
      );
    }

    const enrollments: Enrollment[] | null =
      await this.enrollmentRepository.findAllWithGradesByStudent(
        studentProfile.id,
      );

    if (!enrollments || enrollments.length === 0) {
      throw new NotFoundException(
        `Enrollment or associated groups not found for student ${studentProfile.id}.`,
      );
    }

    const grades: GradesAndPercent[] = [];

    for (const enrollment of enrollments) {
      const courseGrades: GradesAndPercent = {
        course: {
          id: enrollment.course.id,
          course: {
            id: enrollment.course.course.id,
            name: enrollment.course.course.name,
            code: enrollment.course.course.code,
          },
        },

        grades: {
          firstContinue: enrollment.grades.firstContinue,
          secondContinue: enrollment.grades.secondContinue,
          thirdContinue: enrollment.grades.thirdContinue,
          firstPartial: enrollment.grades.firstPartial,
          secondPartial: enrollment.grades.secondPartial,
          thirdPartial: enrollment.grades.thirdPartial,
        },

        percent: {
          firstContinue: enrollment.course.grades!.firstContinue,
          secondContinue: enrollment.course.grades!.secondContinue,
          thirdContinue: enrollment.course.grades!.thirdContinue,
          firstPartial: enrollment.course.grades!.firstPartial,
          secondPartial: enrollment.course.grades!.secondPartial,
          thirdPartial: enrollment.course.grades!.thirdPartial,
        },
      };

      grades.push(courseGrades);
    }

    return grades;
  }

  async getAvaLabGroupsForUser(
    authenticatedUser: JwtPayload,
  ): Promise<AcademicCourseDTO[]> {
    if (authenticatedUser.role !== 'student') {
      throw new ForbiddenException(
        'Solo los estudiantes pueden ver esta información.',
      );
    }
    const studentProfile = await this.studentRepository.findByUserId(
      authenticatedUser.sub,
    );
    if (!studentProfile) {
      throw new NotFoundException(`Perfil de estudiante no encontrado.`);
    }

    const enrollments =
      await this.enrollmentRepository.findByStudentIdAndActives(
        studentProfile.id,
      );
    if (!enrollments || enrollments.length === 0) {
      return [];
    }

    const labSelectionsMap = new Map<string, string>();
    for (const enr of enrollments) {
      const currentLabGroup = enr.groups.find(
        (g) => g.type === GroupType.LABORATORY,
      );
      if (currentLabGroup) {
        labSelectionsMap.set(enr.course.id, currentLabGroup.id);
      }
    }

    const academicCourseIds = enrollments.map((enr) => enr.course.id);

    const allLabGroups =
      await this.academicGroupRepository.findAllByCoursesAndType(
        academicCourseIds,
        GroupType.LABORATORY,
      );

    if (!allLabGroups || allLabGroups.length === 0) {
      return [];
    }

    const coursesMap = new Map<string, AcademicCourseDTO>();

    for (const group of allLabGroups) {
      const courseId = group.academicCourse.id;
      const currentlyEnrolledLabGroupId =
        labSelectionsMap.get(courseId) || null;

      const isCurrentSelection = group.id === currentlyEnrolledLabGroupId;
      const hasCapacity = group.enrollments.length < group.capacity;

      if (hasCapacity || isCurrentSelection) {
        if (!coursesMap.has(courseId)) {
          coursesMap.set(courseId, {
            id: courseId,
            course: {
              id: group.academicCourse.course.id,
              name: group.academicCourse.course.name,
              code: group.academicCourse.course.code,
            },
            groups: [],
            currentlyEnrolledLabGroupId: currentlyEnrolledLabGroupId,
          });
        }

        const schedule: ScheduleSlotDTO[] = group.schedule.map((s) => ({
          id: s.id,
          day: s.day,
          start: s.startTime,
          end: s.endTime,
          classroom: {
            id: s.classroom.id,
            name: s.classroom.name,
            type: s.classroom.type,
          },
        }));

        const groupDto: AcademicGroupDTO = {
          id: group.id,
          name: group.name,
          type: group.type,
          schedule: schedule,
          capacity: group.capacity,
          enrollmentsCount: group.enrollments.length,
        };

        coursesMap.get(courseId)!.groups!.push(groupDto);
      }
    }

    const availableCourses = Array.from(coursesMap.values()).filter(
      (course) => course.groups && course.groups.length > 0,
    );

    return availableCourses;
  }

  async enrollInLabGroups(
    dto: EnrollLabGroupDto,
    authenticatedUser: JwtPayload,
  ): Promise<Enrollment[]> {
    console.log('EnrollLabGroupDto', dto);

    if (authenticatedUser.role !== 'student') {
      throw new ForbiddenException('Solo los estudiantes pueden matricularse.');
    }

    const studentProfile = await this.studentRepository.findByUserId(
      authenticatedUser.sub,
    );
    if (!studentProfile) {
      throw new NotFoundException(`Perfil de estudiante no encontrado.`);
    }

    const labGroupIds = dto.labGroupIds;
    if (!labGroupIds || labGroupIds.length === 0) {
      throw new BadRequestException('No se seleccionó ningún grupo.');
    }

    const updatedEnrollments: Enrollment[] = [];

    const newGroups = await this.academicGroupRepository.findAllById(
      labGroupIds,
      GroupType.LABORATORY,
    );

    console.log('newGroups', newGroups, labGroupIds);

    if (newGroups!.length !== labGroupIds.length) {
      throw new NotFoundException('Uno o más grupos seleccionados no existen.');
    }

    const enrollments =
      await this.enrollmentRepository.findByStudentIdAndActives(
        studentProfile.id,
      );
    if (!enrollments || enrollments.length === 0) {
      throw new NotFoundException(
        `Matrícula no encontrada para el estudiante ${studentProfile.id}.`,
      );
    }

    for (const newGroup of newGroups!) {
      console.log(newGroup);
      if (newGroup.enrollments.length >= newGroup.capacity) {
        const studentAlreadyInGroup = newGroup.enrollments.some(
          (enr) => enr.student?.id === studentProfile.id,
        );
        if (!studentAlreadyInGroup) {
          throw new BadRequestException(
            `El grupo ${newGroup.name} del curso ${newGroup.academicCourse.course.name} está lleno.`,
          );
        }
      }

      const enrollment = enrollments.find(
        (enr) => enr.course.id === newGroup.academicCourse.id,
      );

      if (!enrollment) {
        throw new NotFoundException(
          `Matrícula no encontrada para el curso ${newGroup.academicCourse.course.name}.`,
        );
      }

      enrollment.groups = enrollment.groups.filter(
        (g) => g.type !== GroupType.LABORATORY,
      );

      enrollment.groups.push(newGroup);
      updatedEnrollments.push(enrollment);
    }

    await this.enrollmentRepository.save(updatedEnrollments);

    return updatedEnrollments;
  }
}
