import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { GroupsModule } from 'src/groups/groups.module';

import { Attendance } from './domain/aggregates/attendance.entity';

import { IAttendanceRepository } from './domain/repositories/iattendance.repository';

import { AttendanceRepository } from './infrastructure/attendance.repository';

import { AttendanceService } from './application/attendance.service';
import { AttendanceQueryService } from './application/services/attendance-query.service';
import { TakeAttendanceService } from './application/services/take-attendance.service';
import { AttendanceController } from './presentation/controllers/attendance.controller';
import { UserModule } from 'src/users/users.module';
import { EnrollmentModule } from 'src/enrollment/enrollment.module';

@Module({
  controllers: [AttendanceController],
  imports: [
    TypeOrmModule.forFeature([Attendance]),
    forwardRef(() => GroupsModule),
    forwardRef(() => UserModule),
    forwardRef(() => EnrollmentModule),
  ],
  providers: [
    AttendanceService, // Keep for now, might be removed later
    AttendanceQueryService,
    TakeAttendanceService,
    {
      provide: IAttendanceRepository,
      useClass: AttendanceRepository,
    },
  ],
  exports: [
    IAttendanceRepository,
    AttendanceQueryService,
    TakeAttendanceService,
  ],
})
export class AttendanceModule {}
