import { AcademicCourse } from 'src/courses/aggregates/academic_course.entity';
import { AcademicGroup, GroupType } from '../aggregates/academic_group.entity';

export const IAcademicGroupRepository = Symbol('IAcademicGroupRepository');

export interface IAcademicGroupRepository {
  findById(id: string): Promise<AcademicGroup | null>;
  findAll(): Promise<AcademicGroup[]>;
  findByIdAndType(id: string, type: GroupType): Promise<AcademicGroup | null>;
  findByAcaCourseAndType(
    id: string,
    type: GroupType,
  ): Promise<AcademicGroup[] | null>;
  findAllByCoursesAndType(
    academicCourseIds: string[],
    type: GroupType,
  ): Promise<AcademicGroup[] | null>;
  findAllById(
    academicCourseIds: string[],
    type: GroupType,
  ): Promise<AcademicGroup[] | null>;
  findByIdTeacher(teacherId: string): Promise<AcademicGroup[] | null>;
  findByIdAcademicCourse(
    courseAcademicId: string,
  ): Promise<AcademicGroup[] | null>;
  findByCourseCodeTypeName(
    courseCode: string,
    type: GroupType,
    name: string,
  ): Promise<AcademicGroup[] | null>;
  findByCourseCodeTypeNameAge(
    courseCode: string,
    age: string,
    type: GroupType,
    name: string,
  ): Promise<AcademicGroup | null>;

  getScheduleById(id: string): Promise<AcademicGroup | null>;
  getAcademicCourse(id: string): Promise<AcademicGroup | null>;

  findWithScheduleByTeacherId(
    teacherId: string,
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
