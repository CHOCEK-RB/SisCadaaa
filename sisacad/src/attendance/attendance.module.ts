import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { GroupsModule } from 'src/groups/groups.module';

import { Attendance } from './aggregates/attendance.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Attendance]),
    forwardRef(() => GroupsModule),
  ],
})
export class AttendanceModule {}
