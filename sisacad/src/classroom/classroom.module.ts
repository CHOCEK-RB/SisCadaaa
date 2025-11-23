import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Classroom } from './domain/aggregates/classroom.entity';
import { IClassroomRepository } from './domain/repositories/iclassroom.repository';
import { ClassroomRepository } from './infrastructure/persistence/postgres/classroom.repository';

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
