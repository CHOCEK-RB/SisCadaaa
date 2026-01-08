import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CourseModule } from 'src/courses/course.module';
import { AttendanceModule } from 'src/attendance/attendance.module';
import { EnrollmentModule } from 'src/enrollment/enrollment.module';
import { EventsModule } from 'src/events/events.module';

import { AcademicGroup } from './domain/aggregates/academic_group.entity';
import { ScheduleSlot } from './domain/aggregates/schedule.entity';

import { GradeAttachment } from './domain/aggregates/grade_attachment.entity';

import { IAcademicGroupRepository } from './domain/repositories/iacademic_group.repository';
import { IScheduleSlotRepository } from './domain/repositories/ischedule.repository';

import { AcademicGroupRepository } from './infrastructure/academic_group.repository';
import { ScheduleSlotRepository } from './infrastructure/schedule.repository';
import { GroupsController } from './presentation/controllers/groups.controller';
import { GroupsService } from './application/services/groups.service';
import { GradingPeriodActiveGuard } from 'src/enrollment/presentation/guards/grading-period-active.guard';

import { UserModule } from 'src/users/users.module';
import { ClassroomModule } from 'src/classroom/classroom.module';

@Module({
  controllers: [GroupsController],

  imports: [
    TypeOrmModule.forFeature([AcademicGroup, ScheduleSlot]),
    forwardRef(() => CourseModule),
    forwardRef(() => AttendanceModule),
    forwardRef(() => EnrollmentModule),
    forwardRef(() => UserModule),
    forwardRef(() => ClassroomModule),
    EventsModule,
  ],

  providers: [
    GroupsService,
    GradingPeriodActiveGuard,
    {
      provide: IAcademicGroupRepository,
      useClass: AcademicGroupRepository,
    },
    {
      provide: IScheduleSlotRepository,
      useClass: ScheduleSlotRepository,
    },
  ],

  exports: [IAcademicGroupRepository, IScheduleSlotRepository],
})
export class GroupsModule {}
