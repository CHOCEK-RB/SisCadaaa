import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Classroom } from './aggregates/classrom.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Classroom])],
})
export class ClassroomModule {}
