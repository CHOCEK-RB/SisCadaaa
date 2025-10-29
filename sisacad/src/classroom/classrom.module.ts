import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Classroom } from './aggregates/classrom.entity';
import { IClassroomRepository } from './infrastructure/iclassroom.repository';
import { ClassroomRepository } from './infrastructure/classroom.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Classroom])],
  providers: [
    {
      provide: IClassroomRepository,
      useClass: ClassroomRepository,
    },
  ],

  exports: [IClassroomRepository],
})
export class ClassroomModule {}
