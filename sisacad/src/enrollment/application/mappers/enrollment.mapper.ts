import { Injectable } from '@nestjs/common';
import { Enrollment } from '../../domain/aggregates/enrollment.entity';
import { EnrollmentDetailDTO } from '../dto/enrollment.dto';
import { CourseDTO } from 'src/courses/application/dto/course.dto';
import { AcademicCourseDTO } from 'src/courses/application/dto/academic_course.dto';

@Injectable()
export class EnrollmentMapper {
  toDto(enrollment: Enrollment): EnrollmentDetailDTO {
    const courseDto: CourseDTO = {
      id: enrollment.course.course.id,
      name: enrollment.course.course.name,
      code: enrollment.course.course.code,
      semester: enrollment.course.course.semester,
      credits: enrollment.course.course.credits,
    };

    const academicCourseDto: AcademicCourseDTO = {
      id: enrollment.course.id,
      creationDate: enrollment.course.creationDate,
      urlSyllabus: enrollment.course.urlSyllabus,
      course: courseDto,
      coordinator: enrollment.course.coordinator
        ? {
            id: enrollment.course.coordinator.id,
            firstName: enrollment.course.coordinator.name,
            lastName:
              `${enrollment.course.coordinator.firstLastName} ${enrollment.course.coordinator.secondLastName}`.trim(),
            role: 'teacher',
            email: enrollment.course.coordinator.user?.email,
          }
        : undefined,
    };

    const enrollmentDto: EnrollmentDetailDTO = {
      id: enrollment.id,
      date: enrollment.date,
      grades: enrollment.grades,
      academicCourse: academicCourseDto,
    };

    return enrollmentDto;
  }
}
