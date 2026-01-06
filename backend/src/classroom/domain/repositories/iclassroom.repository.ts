import { Classroom, ClassroomType } from '../aggregates/classroom.entity';

export const IClassroomRepository = Symbol('IClassroomRepository');

export interface IClassroomRepository {
  findById(id: string): Promise<Classroom | null>;
  findByType(type: ClassroomType): Promise<Classroom[] | null>;
  findByName(name: string): Promise<Classroom | null>;
  findAll(): Promise<Classroom[] | null>;
  save(classroom: Classroom): Promise<Classroom>;
  save(classrooms: Classroom[]): Promise<Classroom[]>;
  add(classroom: Classroom): Promise<Classroom>;
}
