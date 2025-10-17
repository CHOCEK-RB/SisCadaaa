import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AcademicCourse } from './aggregates/academic_course.entity';
import { Course } from './aggregates/course.entity';
import { CourseTopic } from './aggregates/course_topic.entity';

import { ICourseRepository } from './infrastructure/icourse.repository';
import { IAcademicCourseRepository } from './infrastructure/icourse_academic.repository';
import { ICourseTopicRepository } from './infrastructure/icourse_topic.repository';

import { CourseRepository } from './infrastructure/course.repository';
import { AcademicCourseRepository } from './infrastructure/course_academic.repository';
import { CourseTopicRepository } from './infrastructure/course_topic.repository';

@Module({
  imports: [TypeOrmModule.forFeature([AcademicCourse, Course, CourseTopic])],
  providers: [
    {
      provide: ICourseRepository,
      useClass: CourseRepository,
    },
    {
      provide: IAcademicCourseRepository,
      useClass: AcademicCourseRepository,
    },
    {
      provide: ICourseTopicRepository,
      useClass: CourseTopicRepository,
    },
  ],
  exports: [
    ICourseRepository,
    IAcademicCourseRepository,
    ICourseTopicRepository,
  ],
})
export class CourseModule {}
