import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IAcademicCourseRepository } from '../infrastructure/icourse_academic.repository';
import { AcademicCourseDTO } from './dto/academic_course.dto';
import { CourseDTO } from './dto/course.dto';
import { CourseTopicDTO } from './dto/course_topic.dto';
import { JwtPayload } from 'src/auth/interface/jwt-payload.interface';

@Injectable()
export class AcademicCourseService {
  constructor(
    @Inject(IAcademicCourseRepository)
    private readonly academicCourseRepository: IAcademicCourseRepository,
  ) {}

  async findDetailsById(
    id: string,
    authenticatedUser: JwtPayload,
  ): Promise<AcademicCourseDTO> {
    console.log(id);
    console.log(authenticatedUser);
    const academicCourse = await this.academicCourseRepository.findById(id);

    if (!academicCourse) {
      throw new NotFoundException(`AcademicCourse with ID ${id} not found`);
    }

    if (!academicCourse.course) {
      throw new NotFoundException(
        `Course not found for AcademicCourse with ID ${id}`,
      );
    }

    const courseDto: CourseDTO = {
      id: academicCourse.course.id,
      code: academicCourse.course.code,
      name: academicCourse.course.name,
      credits: academicCourse.course.credits,
      semester: academicCourse.course.semester,
    };

    const topicsDto: CourseTopicDTO[] | null = academicCourse.topics.map(
      (topic) => ({
        id: topic.id,
        order: topic.topicOrder,
        topic: topic.topic,
      }),
    );

    const detailDto: AcademicCourseDTO = {
      id: academicCourse.id,
      creationDate: academicCourse.creationDate,
      urlSyllabus: academicCourse.urlSyllabus,
      course: courseDto,
      topics: topicsDto,
    };

    return detailDto;
  }
}
