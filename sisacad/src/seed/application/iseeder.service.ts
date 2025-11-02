export const ISeederService = Symbol('ISeederService');

export interface ISeederService {
  seedStudents(filePath: string): Promise<void>;
  seedTeachers(filePath: string): Promise<void>;
  seedSecretary(filePath: string): Promise<void>;
  seedAdmin(filePath: string): Promise<void>;
  seedCourses(filePath: string): Promise<void>;
  seedClassrooms(filePath: string): Promise<void>;
  seedSchedule(filePath: string): Promise<void>;
  seedTopics(filePath: string): Promise<void>;

  runAll(): Promise<void>;
}
