import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';

import { EnrollmentPeriodService } from 'src/enrollment/application/enrollment_period.service';

import { PeriodType } from 'src/enrollment/aggregates/enrollment_period.entity';

@Injectable()
export class LabEnrollmentActiveGuard implements CanActivate {
  constructor(
    private readonly enrollmentPeriodService: EnrollmentPeriodService,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isActive = await this.enrollmentPeriodService.isPeriodActive(
      PeriodType.LABORATORY,
    );

    if (!isActive) {
      throw new ForbiddenException(
        'El período de matrícula de laboratorios no está activo.',
      );
    }
    return true;
  }
}
