import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Classroom } from './domain/aggregates/classroom.entity';
import { IClassroomRepository } from './domain/repositories/iclassroom.repository';
import { ClassroomRepository } from './infrastructure/persistence/postgres/classroom.repository';
import { ClassroomController } from './presentation/controllers/classroom.controller';
import { ClassroomService } from './application/services/classroom.service';
import { GroupsModule } from 'src/groups/groups.module';
import { ReservationModule } from 'src/reservation/reservation.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Classroom]),
    forwardRef(() => GroupsModule),
    forwardRef(() => ReservationModule),
  ],
  controllers: [ClassroomController],
  providers: [
    ClassroomService,
    {
      provide: IClassroomRepository,
      useClass: ClassroomRepository,
    },
  ],

  exports: [IClassroomRepository, ClassroomService],
})
export class ClassroomModule {}
