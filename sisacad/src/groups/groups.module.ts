import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AcademicGroup } from './aggregates/academic_group.entity';
import { ScheduleSlot } from './aggregates/schedule.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AcademicGroup, ScheduleSlot])],
})
export class GroupsModule {}
