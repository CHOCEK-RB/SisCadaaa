import { AcademicGroup, GroupType } from '../aggregates/academic_group.entity';

export const IAcademicGroupRepository = Symbol('IAcademicGroupRepository');

export interface IAcademicGroupRepository {
  findById(id: string): Promise<AcademicGroup | null>;
  findGroupDetailsById(id: string): Promise<AcademicGroup | null>;
  findGroupGradesById(id: string): Promise<AcademicGroup | null>;
  findByIdWithEnrolledStudents(groupId: string): Promise<AcademicGroup | null>;
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
  findByGroupIds(
    groupIds: string[],
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

  findGroupsByCourseIdWithTeacherAndTopics(
    courseId: string,
  ): Promise<AcademicGroup[] | null>;

  getScheduleById(id: string): Promise<AcademicGroup | null>;
  getAcademicCourse(id: string): Promise<AcademicGroup | null>;

  findWithScheduleByTeacherId(
    teacherId: string,
  ): Promise<AcademicGroup[] | null>;

  save(group: AcademicGroup): Promise<AcademicGroup>;
  save(groups: AcademicGroup[]): Promise<AcademicGroup[]>;
  add(group: AcademicGroup): Promise<AcademicGroup>;
  getCourseInfo(id: string): Promise<AcademicGroup | null>;
  getEnrollments(id: string): Promise<AcademicGroup | null>;
  getAttendances(id: string): Promise<AcademicGroup | null>;
  findByClassroomId(classroomId: string): Promise<AcademicGroup[]>;
}
