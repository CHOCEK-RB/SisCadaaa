import { EnrollmentDetailDTO } from './enrollment.dto';

export class GroupedEnrollmentsResponseDto {
  [period: string]: EnrollmentDetailDTO[];
}
