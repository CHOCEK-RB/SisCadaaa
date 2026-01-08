import { Injectable, Inject } from '@nestjs/common';
import { ICourseRepository } from '../../domain/repositories/icourse.repository';
import { CourseDTO } from '../dto/course.dto';
import { CourseMapper } from '../mappers/course.mapper';

@Injectable()
export class CourseService {
  constructor(
    @Inject(ICourseRepository)
    private readonly courseRepository: ICourseRepository,
    private readonly courseMapper: CourseMapper,
  ) {}

  async searchCourses(query: string): Promise<CourseDTO[]> {
    const courses = await this.courseRepository.searchCourses(query);
    return courses.map(course => this.courseMapper.toDto(course));
  }
}
