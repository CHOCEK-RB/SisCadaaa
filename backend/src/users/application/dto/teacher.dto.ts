import { UserProfileDTO } from './user.dto';

export class TeacherProfileDTO extends UserProfileDTO {
  role: 'teacher';
}
