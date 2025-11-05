import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Enrollment } from './aggregates/enrollment.entity';
import { EnrollmentPeriod } from './aggregates/enrollment_period.entity';

import { EnrollmentController } from './presentation/enrollment.controller';
import { EnrollmentService } from './application/enrollment.service';

import { IEnrollmentRepository } from './infrastructure/ienrollment.repository';
import { EnrollmentRepository } from './infrastructure/enrollment.repository';

import { EnrollmentPeriodService } from './application/enrollment_period.service';

import { IEnrollmentPeriodRepository } from './infrastructure/ienrollment_period.repository';
import { EnrollmentPeriodRepository } from './infrastructure/enrollment_period.repository';

import { UserModule } from 'src/users/users.module';
import { GroupsModule } from 'src/groups/groups.module';

@Module({
  controllers: [EnrollmentController],
  imports: [
    TypeOrmModule.forFeature([Enrollment, EnrollmentPeriod]),
    forwardRef(() => UserModule),
    forwardRef(() => GroupsModule),
  ],
  providers: [
    EnrollmentService,
    EnrollmentPeriodService,
    {
      provide: IEnrollmentRepository,
      useClass: EnrollmentRepository,
    },
    {
      provide: IEnrollmentPeriodRepository,
      useClass: EnrollmentPeriodRepository,
    },
  ],
  exports: [IEnrollmentRepository, IEnrollmentPeriodRepository],
})
export class EnrollmentModule {}
