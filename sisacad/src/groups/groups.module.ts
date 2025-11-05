import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CourseModule } from 'src/courses/course.module';
import { AttendanceModule } from 'src/attendance/attendance.module';
import { EnrollmentModule } from 'src/enrollment/enrollment.module';

import { AcademicGroup } from './aggregates/academic_group.entity';
import { ScheduleSlot } from './aggregates/schedule.entity';

import { IAcademicGroupRepository } from './infrastructure/iacademic_group.repository';
import { IScheduleSlotRepository } from './infrastructure/ischedule.repository';

import { AcademicGroupRepository } from './infrastructure/academic_group.repository';
import { ScheduleSlotRepository } from './infrastructure/schedule.repository';
import { GroupsController } from './presentation/groups.controller';
import { GroupsService } from './application/groups.service';

import { UserModule } from 'src/users/users.module';

@Module({
  controllers: [GroupsController],

  imports: [
    TypeOrmModule.forFeature([AcademicGroup, ScheduleSlot]),
    forwardRef(() => CourseModule),
    forwardRef(() => AttendanceModule),
    forwardRef(() => EnrollmentModule),
    forwardRef(() => UserModule),
  ],

  providers: [
    GroupsService,
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
