import { Injectable, Inject } from '@nestjs/common';
import { PeriodType } from '../aggregates/enrollment_period.entity';

import { IEnrollmentPeriodRepository } from '../infrastructure/ienrollment_period.repository';

@Injectable()
export class EnrollmentPeriodService {
  constructor(
    @Inject(IEnrollmentPeriodRepository)
    private readonly periodRepository: IEnrollmentPeriodRepository,
  ) {}

  async isPeriodActive(type: PeriodType): Promise<boolean> {
    const activePeriod = await this.periodRepository.findActive(type);

    return !!activePeriod;
  }
}
