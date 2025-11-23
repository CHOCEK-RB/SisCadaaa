import { Student } from '../aggregates/student.entity';
import { User } from '../aggregates/user.entity';

export const IStudentRepository = Symbol('IStudentRepository');

export interface IStudentRepository {
  findById(id: string): Promise<Student | null>;
  findAll(): Promise<Student[] | null>;
  findByUserId(userId: string): Promise<Student | null>;
  save(student: Student): Promise<Student>;
  add(student: Student): Promise<Student>;
}
