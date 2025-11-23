import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AcademicCourse } from './domain/aggregates/academic_course.entity';
import { Course } from './domain/aggregates/course.entity';
import { CourseTopic } from './domain/aggregates/course_topic.entity';
import { TopicProgress } from './domain/aggregates/topic_progress.entity';

import { ICourseRepository } from './domain/repositories/icourse.repository';
import { IAcademicCourseRepository } from './domain/repositories/icourse_academic.repository';
import { ICourseTopicRepository } from './domain/repositories/icourse_topic.repository';
import { ITopicProgressRepository } from './domain/repositories/itopic_progress.repository';

import { AcademicCourseService } from './application/services/academic_course.service';
import { AcademicCourseMapper } from './application/mappers/academic-course.mapper';

import { AcademicCourseController } from './presentation/controllers/academic_course.controller';

import { CourseRepository } from './infrastructure/persistence/postgres/course.repository';
import { AcademicCourseRepository } from './infrastructure/persistence/postgres/course_academic.repository';
import { CourseTopicRepository } from './infrastructure/persistence/postgres/course_topic.repository';
import { TopicProgressRepository } from './infrastructure/persistence/postgres/topic_progress.repository';
import { GroupsModule } from 'src/groups/groups.module';

@Module({
  controllers: [AcademicCourseController],
  imports: [
    TypeOrmModule.forFeature([
      AcademicCourse,
      Course,
      CourseTopic,
      TopicProgress,
    ]),
    forwardRef(() => GroupsModule),
  ],

  providers: [
    AcademicCourseService,
    AcademicCourseMapper,
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
    {
      provide: ITopicProgressRepository,
      useClass: TopicProgressRepository,
    },
  ],
  exports: [
    ICourseRepository,
    IAcademicCourseRepository,
    ICourseTopicRepository,
    ITopicProgressRepository,
  ],
})
export class CourseModule {}
