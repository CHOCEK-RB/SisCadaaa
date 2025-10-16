import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AcademicCourse } from './aggregates/academic_course.entity';
import { Course } from './aggregates/course.entity';
import { CourseTopic } from './aggregates/course_topic.entity';

import { ICourseRepository } from './infrastructure/icourse.repository';

import { CourseRepository } from './infrastructure/course.repository';

@Module({
  imports: [TypeOrmModule.forFeature([AcademicCourse, Course, CourseTopic])],
  providers: [
    {
      provide: ICourseRepository,
      useClass: CourseRepository,
    },
  ],
  exports: [ICourseRepository],
})
export class CourseModule {}
