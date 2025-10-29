import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Enrollment } from './aggregates/enrollment.entity';

import { EnrollmentController } from './presentation/enrollment.controller';
import { EnrollmentService } from './application/enrollment.service';

import { IEnrollmentRepository } from './infrastructure/ienrollment.repository';
import { EnrollmentRepository } from './infrastructure/enrollment.repository';

import { UserModule } from 'src/users/users.module';

@Module({
  controllers: [EnrollmentController],
  imports: [
    TypeOrmModule.forFeature([Enrollment]),
    forwardRef(() => UserModule),
  ],
  providers: [
    EnrollmentService,
    {
      provide: IEnrollmentRepository,
      useClass: EnrollmentRepository,
    },
  ],
  exports: [IEnrollmentRepository],
})
export class EnrollmentModule {}
