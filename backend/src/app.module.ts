import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

import { typeOrmConfig } from './config/typeorm.config';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { UserModule } from './users/users.module';
import { CourseModule } from './courses/course.module';
import { ClassroomModule } from './classroom/classroom.module';
import { GroupsModule } from './groups/groups.module';
import { AttendanceModule } from './attendance/attendance.module';
import { AuthModule } from './auth/auth.module';
import { EnrollmentModule } from './enrollment/enrollment.module';
import { SeedingModule } from './seed/seeding.module';
import { StudentModule } from './student/student.module';
import { TeacherModule } from './teacher/teacher.module';
import { EventsModule } from './events/events.module';
import { ReservationModule } from './reservation/reservation.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: ['.db.env', '.env'] }),

    TypeOrmModule.forRootAsync(typeOrmConfig),
    SeedingModule,
    UserModule,
    CourseModule,
    AuthModule,
    ClassroomModule,
    AttendanceModule,
    GroupsModule,
    EnrollmentModule,
    StudentModule,
    TeacherModule,
    EventsModule,
    ReservationModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

