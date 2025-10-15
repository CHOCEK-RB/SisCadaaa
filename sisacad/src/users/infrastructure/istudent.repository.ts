import { Student } from '../aggregates/student.entity';
import { User } from '../aggregates/user.entity';

export const IStudentRepository = Symbol('IStudentRepository');

export interface IStudentRepository {
  findById(id: string): Promise<Student | null>;
  findByUserId(userId: string): Promise<Student | null>;
  save(student: Student): Promise<Student>;
  create(user: User, profileData: Partial<Student>): Promise<Student>;
}
