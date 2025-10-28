import { UserProfileDTO } from './user.dto';
import { EnrollmentDetailDTO } from 'src/enrollment/application/dto/enrollment.dto';

export class StudentProfileDTO extends UserProfileDTO {
  role: 'student';
  cui: string;
  semester: number;
  enrollments: EnrollmentDetailDTO[];
}
