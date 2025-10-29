import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { GroupsModule } from 'src/groups/groups.module';

import { Attendance } from './aggregates/attendance.entity';

import { IAttendanceRepository } from './infrastructure/iattendance.repository';

import { AttendanceRepository } from './infrastructure/attendance.repository';

import { AttendanceService } from './applicaction/attendance.service';
import { AttendanceController } from './presentation/attendance.controller';
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
    AttendanceService,
    {
      provide: IAttendanceRepository,
      useClass: AttendanceRepository,
    },
  ],
  exports: [IAttendanceRepository],
})
export class AttendanceModule {}
