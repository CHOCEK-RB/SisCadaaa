export const ISeederServiceAcademic = Symbol('ISeederServiceAcademic');

export interface ISeederServiceAcademic {
  seedAcademicCourses(): Promise<void>;
  runAll(): Promise<void>;
}
