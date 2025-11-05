import {
  EnrollmentPeriod,
  PeriodType,
} from '../aggregates/enrollment_period.entity';

export const IEnrollmentPeriodRepository = Symbol(
  'IEnrollmentPeriodRepository',
);

export interface IEnrollmentPeriodRepository {
  findByType(type: PeriodType): Promise<EnrollmentPeriod[]>;
  findActive(type: PeriodType): Promise<EnrollmentPeriod | null>;
  save(enrollmentPeriod: EnrollmentPeriod): Promise<EnrollmentPeriod>;
}
