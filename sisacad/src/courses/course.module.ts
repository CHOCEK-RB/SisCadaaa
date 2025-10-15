import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AcademicCourse } from './aggregates/academic_course.entity';
import { Course } from './aggregates/course.entity';
import { CourseTopic } from './aggregates/course_topic.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AcademicCourse, Course, CourseTopic])],
})
export class CourseModule {}
