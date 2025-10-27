import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Enrollment } from './aggregates/enrollment.entity';

import { IEnrollmentRepository } from './infrastructure/ienrollment.repository';
import { EnrollmentRepository } from './infrastructure/enrollment.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Enrollment])],
  providers: [
    {
      provide: IEnrollmentRepository,
      useClass: EnrollmentRepository,
    },
  ],
  exports: [IEnrollmentRepository],
})
export class EnrollmentModule {}
