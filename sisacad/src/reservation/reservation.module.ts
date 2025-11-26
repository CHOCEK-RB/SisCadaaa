import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReservationController } from './presentation/controllers/reservation.controller';
import { ReservationService } from './application/services/reservation.service';
import { Reservation } from './domain/aggregates/reservation.entity';
import { IReservationRepository } from './domain/repositories/ireservation.repository';
import { ReservationPostgresRepository } from './infrastructure/persistence/postgres/reservation.repository';

import { ClassroomModule } from 'src/classroom/classroom.module';
import { UserModule } from 'src/users/users.module';

import { GroupsModule } from 'src/groups/groups.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Reservation]),
    forwardRef(() => ClassroomModule),
    forwardRef(() => UserModule),
    forwardRef(() => GroupsModule),
  ],
  controllers: [ReservationController],
  providers: [
    ReservationService,
    {
      provide: IReservationRepository,
      useClass: ReservationPostgresRepository,
    },
  ],
  exports: [IReservationRepository],
})
export class ReservationModule {}
