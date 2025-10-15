import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Attendance } from './aggregates/attendance.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Attendance])],
})
export class AttendanceModule {}
