import { Teacher } from '../aggregates/teacher.entity';
import { User } from '../aggregates/user.entity';

export const ITeacherRepository = Symbol('ITeacherRepository');

export interface ITeacherRepository {
  getIdForUserId(userId: string): Promise<string | null>;
  findById(id: string): Promise<Teacher | null>;
  findAll(): Promise<Teacher[] | null>;
  findByUserId(userId: string): Promise<Teacher | null>;
  findRandom(): Promise<Teacher | null>;
  save(teacher: Teacher): Promise<Teacher>;
  create(user: User, profileData: Partial<Teacher>): Promise<Teacher>;
}
