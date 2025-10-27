import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Classroom } from './aggregates/classrom.entity';
import { IClassroomRepository } from './application/iclassroom.repository';
import { ClassroomRepository } from './application/classroom.repository';

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
