import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SeederStudentService } from './application/seeder_student.service';
import { SeederTeacherService } from './application/seeder_teacher.service';
import { SeederCoursesService } from './application/seeder_courses.service';
import { SeederTopicsService } from './application/seeder_topics.service';
import { SeederScheduleService } from './application/seeder_schedule.service';
import { SeederClassroomsService } from './application/seeder_classrooms.service';
import { SeederAcademicCoursesService } from './application/seeder_academic_courses.service';
import { SeederAcademicGroupsService } from './application/seeder_academic_groups.service';
import { SeederEnrollmentService } from './application/seeder_enrollment.service';
import { SeederAttendanceService } from './application/seeder_attendance.service';
import { SeederTopicProgressService } from './application/seeder_topic_progress.service';
import { SeederEventsService } from './application/seeder_events.service';
import { SeederSecretaryService } from './application/seeder_secretary.service';

import { UserModule } from 'src/users/users.module';
import { CourseModule } from 'src/courses/course.module';
import { ClassroomModule } from 'src/classroom/classroom.module';
import { GroupsModule } from 'src/groups/groups.module';
import { EnrollmentModule } from 'src/enrollment/enrollment.module';
import { AttendanceModule } from 'src/attendance/attendance.module';
import { EventsModule } from 'src/events/events.module';

import { typeOrmConfig } from '../config/typeorm.config';
import { ReservationModule } from 'src/reservation/reservation.module';
import { SeederReservationService } from './application/seeder_reservation.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: ['.db.env', '.env'] }),
    TypeOrmModule.forRootAsync(typeOrmConfig),
    UserModule,
    CourseModule,
    ClassroomModule,
    GroupsModule,
    EnrollmentModule,
    AttendanceModule,
    EventsModule,
    ReservationModule,
  ],

  providers: [
    SeederStudentService,
    SeederTeacherService,
    SeederSecretaryService,
    SeederCoursesService,
    SeederTopicsService,
    SeederScheduleService,
    SeederClassroomsService,
    SeederAcademicCoursesService,
    SeederAcademicGroupsService,
    SeederEnrollmentService,
    SeederAttendanceService,
    SeederTopicProgressService,
    SeederEventsService,
    SeederReservationService,
  ],
  exports: [
    SeederStudentService,
    SeederTeacherService,
    SeederSecretaryService,
    SeederCoursesService,
    SeederTopicsService,
    SeederScheduleService,
    SeederClassroomsService,
    SeederAcademicCoursesService,
    SeederAcademicGroupsService,
    SeederEnrollmentService,
    SeederAttendanceService,
    SeederTopicProgressService,
    SeederEventsService,
    SeederReservationService,
  ],
})
export class SeedingModule {}

