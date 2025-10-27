import { AcademicCourse } from 'src/courses/aggregates/academic_course.entity';
import { AcademicGroup, GroupType } from '../aggregates/academic_group.entity';

export const IAcademicGroupRepository = Symbol('IAcademicGroupRepository');

export interface IAcademicGroupRepository {
  findById(id: string): Promise<AcademicGroup | null>;
  findAll(): Promise<AcademicGroup[]>;
  findByIdTeacher(teacherId: string): Promise<AcademicGroup[] | null>;
  findByIdAcademicCourse(
    courseAcademicId: string,
  ): Promise<AcademicGroup[] | null>;
  save(group: AcademicGroup): Promise<AcademicGroup>;
  save(groups: AcademicGroup[]): Promise<AcademicGroup[]>;
  create(
    name: string,
    capacity: number,
    type: GroupType,
    course: AcademicCourse,
  ): Promise<AcademicGroup>;
}
