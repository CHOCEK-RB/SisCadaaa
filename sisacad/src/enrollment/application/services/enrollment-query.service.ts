import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtPayload } from 'src/auth/domain/interfaces/jwt-payload.interface';
import { IEnrollmentRepository } from '../../domain/repositories/ienrollment.repository';
import { IStudentRepository } from 'src/users/domain/repositories/istudent.repository';
import { Enrollment } from '../../domain/aggregates/enrollment.entity';
import { AcademicGroupDTO } from 'src/groups/application/dto/academic_group.dto';
import { ScheduleSlotDTO } from 'src/groups/application/dto/schedule.dto';
import { EnrollmentMapper } from '../mappers/enrollment.mapper';
import { GroupedEnrollmentsResponseDto } from '../dto/grouped-enrollments-response.dto';
import { GradesAndPercentResponseDto } from '../dto/grades-and-percent-response.dto';
import { GradesAndSchemeDTO } from '../dto/grades-and-scheme.dto';

@Injectable()
export class EnrollmentQueryService {
  constructor(
    @Inject(IEnrollmentRepository)
    private readonly enrollmentRepository: IEnrollmentRepository,
    @Inject(IStudentRepository)
    private readonly studentRepository: IStudentRepository,
    private readonly enrollmentMapper: EnrollmentMapper,
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
  ): Promise<GroupedEnrollmentsResponseDto> {
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

    const grouped: GroupedEnrollmentsResponseDto = {};

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

      grouped[period].push(this.enrollmentMapper.toDto(enr));
    }

    const sortedGrouped: GroupedEnrollmentsResponseDto = Object.keys(grouped)
      .sort((a, b) => {
        const [yearA, semesterA] = a.split('-');
        const [yearB, semesterB] = b.split('-');
        if (yearA !== yearB) return parseInt(yearB) - parseInt(yearA);
        return semesterB.localeCompare(semesterA);
      })
      .reduce((acc, key) => {
        acc[key] = grouped[key];
        return acc;
      }, {} as GroupedEnrollmentsResponseDto);

    return sortedGrouped;
  }

  async getMyGradesForCourse(
    academicCourseId: string,
    authenticatedUser: JwtPayload,
  ): Promise<GradesAndSchemeDTO | null> {
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

    if (!enrollment.course || !enrollment.course.grades) {
      throw new NotFoundException(
        `Grading scheme not found for course ${academicCourseId}.`,
      );
    }

    return {
      grades: enrollment.grades,
      scheme: enrollment.course.grades,
    };
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
  ): Promise<GradesAndPercentResponseDto[]> {
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

    const grades: GradesAndPercentResponseDto[] = [];

    for (const enrollment of enrollments) {
      const courseGrades: GradesAndPercentResponseDto = {
        course: {
          id: enrollment.course.id,
          creationDate: enrollment.course.creationDate,
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
}
