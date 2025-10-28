import { UserProfileDTO } from './user.dto';

export class AdminProfileDTO extends UserProfileDTO {
  role: 'admin';
}
