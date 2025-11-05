import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  EnrollmentPeriod,
  PeriodType,
} from '../aggregates/enrollment_period.entity';
import { LessThanOrEqual, MoreThanOrEqual } from 'typeorm';

import { IEnrollmentPeriodRepository } from './ienrollment_period.repository';

@Injectable()
export class EnrollmentPeriodRepository implements IEnrollmentPeriodRepository {
  constructor(
    @InjectRepository(EnrollmentPeriod)
    private readonly enrollmentPeriodRepository: Repository<EnrollmentPeriod>,
  ) {}
  async findByType(type: PeriodType): Promise<EnrollmentPeriod[]> {
    return await this.enrollmentPeriodRepository.find({ where: { type } });
  }
  async findActive(type: PeriodType): Promise<EnrollmentPeriod | null> {
    const now = new Date();

    return await this.enrollmentPeriodRepository.findOne({
      where: {
        type: type,
        isActive: true,
        startDate: LessThanOrEqual(now),
        endDate: MoreThanOrEqual(now),
      },
    });
  }
  async save(enrollmentPeriod: EnrollmentPeriod): Promise<EnrollmentPeriod> {
    return await this.enrollmentPeriodRepository.save(enrollmentPeriod);
  }
}
