export const ISeederServiceAcademic = Symbol('ISeederServiceAcademic');

export interface ISeederServiceAcademic {
  seedAcademicCourses(): Promise<void>;
  seedAcademicGroups(): Promise<void>;
  seedEnrollment(): Promise<void>;
  runAll(): Promise<void>;
}
