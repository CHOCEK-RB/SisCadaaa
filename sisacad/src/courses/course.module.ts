import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AcademicCourse } from './aggregates/academic_course.entity';
import { Course } from './aggregates/course.entity';
import { CourseTopic } from './aggregates/course_topic.entity';

import { ICourseRepository } from './infrastructure/icourse.repository';
import { IAcademicCourseRepository } from './infrastructure/icourse_academic.repository';
import { ICourseTopicRepository } from './infrastructure/icourse_topic.repository';

import { AcademicCourseService } from './application/academic_course.service';

import { AcademicCourseController } from './presentation/academic_course.controller';

import { CourseRepository } from './infrastructure/course.repository';
import { AcademicCourseRepository } from './infrastructure/course_academic.repository';
import { CourseTopicRepository } from './infrastructure/course_topic.repository';
import { GroupsModule } from 'src/groups/groups.module';

@Module({
  controllers: [AcademicCourseController],
  imports: [
    TypeOrmModule.forFeature([AcademicCourse, Course, CourseTopic]),
    forwardRef(() => GroupsModule),
  ],

  providers: [
    AcademicCourseService,
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
