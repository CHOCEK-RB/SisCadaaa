export const ISeederServiceAcademic = Symbol('ISeederServiceAcademic');

export interface ISeederServiceAcademic {
  seedAcademicCourses(): Promise<void>;
  seedAcademicGroups(): Promise<void>;
  seedEnrollment(): Promise<void>;
  seedAttendance(): Promise<void>;
  seedAcademicCourses(): Promise<void>;
  runAll(): Promise<void>;
}
