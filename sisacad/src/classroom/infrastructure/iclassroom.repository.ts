import { Classroom, ClassroomType } from '../aggregates/classrom.entity';

export const IClassroomRepository = Symbol('IClassroomRepository');

export interface IClassroomRepository {
  findById(id: string): Promise<Classroom | null>;
  findByType(type: ClassroomType): Promise<Classroom[] | null>;
  findAll(): Promise<Classroom[] | null>;
  save(classroom: Classroom): Promise<Classroom>;
  save(classrooms: Classroom[]): Promise<Classroom[]>;
  create(
    name: string,
    location: string,
    type: ClassroomType,
  ): Promise<Classroom | null>;
}
