import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';

import { JwtPayload } from 'src/auth/interface/jwt-payload.interface';

import { IEnrollmentRepository } from '../infrastructure/ienrollment.repository';
import { IStudentRepository } from 'src/users/infrastructure/istudent.repository';

import { EnrollmentDetailDTO } from '../application/dto/enrollment.dto';
import { AcademicCourseDTO } from 'src/courses/application/dto/academic_course.dto';
import { CourseDTO } from 'src/courses/application/dto/course.dto';

export interface GroupedEnrollments {
  [period: string]: EnrollmentDetailDTO[];
}

@Injectable()
export class EnrollmentService {
  constructor(
    @Inject(IEnrollmentRepository)
    private readonly enrollmentRepository: IEnrollmentRepository,
    @Inject(IStudentRepository)
    private readonly studentRepository: IStudentRepository,
  ) {}

  private getAcademicPeriodLabel(date: Date): string {
    const year = date.getFullYear();
    const month = date.getMonth();

    if (month >= 2 && month < 7) {
      return `${year}-A`;
    } else {
      return `${year}-B`;
    }
  }

  async getMyEnrollmentsGroupedByPeriod(
    authenticatedUser: JwtPayload,
  ): Promise<GroupedEnrollments> {
    console.log(authenticatedUser);

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

    console.log(grouped);

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
}
