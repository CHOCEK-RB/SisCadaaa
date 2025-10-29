export type UserRole =
  | 'student'
  | 'teacher'
  | 'secretary'
  | 'admin'
  | 'unknown';

export interface GroupedEnrollments {
  [period: string]: EnrollmentDetailDTO[];
}

export interface EnrollmentDetailDTO {
  id: string;
  student?: StudentProfileDTO;
  date: string;
  grades?: Grades;
  academicCourse: AcademicCourseDTO;
}

export interface Grades {
  firstContinue: number;
  secondConitnue: number;
  thirdContinue: number;
  firstPartial: number;
  secondPartial: number;
  thirdPartial: number;
}

export interface GradingScheme {
  firstContinue: number;
  secondContinue: number;
  thirdContinue: number;
  firstPartial: number;
  secondPartial: number;
  thirdPartial: number;
}

export interface CourseTopicDTO {
  id: string;
  order: number;
  topic: string;
}

export interface AcademicCourseDTO {
  id: string;
  creationDate: Date;
  urlSyllabus?: string;
  course: CourseDTO;
  grades?: GradingScheme;

  coordinator?: TeacherProfileDTO;
  groups?: AcademicGroupDTO[];
  topics?: CourseTopicDTO[];
  enrollments?: EnrollmentDetailDTO[];
}

export interface AcademicGroupDTO {
  id: string;
  name: string;
  capacity: number;
  type: string;
  schedule?: ScheduleSlotDTO[];
  course: AcademicCourseDTO;
  teacher: TeacherProfileDTO;
}

export interface ScheduleSlotDTO {
  id: string;
  day: string;
  start: string;
  end: string;
  classroom: ClassroomDTO;
  group: string;
}

export interface ClassroomDTO {
  id: string;
  name: string;
  description: string;
  schedule: ScheduleSlotDTO[];
}

export interface CourseDTO {
  id: string;
  name: string;
  code: string;
  semester: number;
  credits: number;
  preRrqs?: CourseDTO[];
  academicCourses?: AcademicCourseDTO[];
}

export interface JwtPayload {
  sub: string;
  email: string;
  pictureURL: string;
}

export interface AuthenticatedUserInfo {
  id: string;
  email: string;
  pictureUrl?: string;
  isActive: boolean;
}

export interface UserProfileDTO {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  iconURL?: string;
  isActive: boolean;
}

export interface StudentProfileDTO extends UserProfileDTO {
  role: 'student';
  cui: string;
  semester: number;
  enrollments: EnrollmentDetailDTO[];
}

export interface TeacherProfileDTO extends UserProfileDTO {
  role: 'teacher';
}

export enum AttendanceStatus {
  PRESENT = 'present',
  ABSENT = 'absent',
}

export enum GroupType {
  LABORATORY = 'laboratory',
  THEORY = 'theory',
  PRACTICE = 'practice',
}

export interface StudentAttendanceRecordDTO {
  classDate: string;
  status: AttendanceStatus;
}

export interface GroupAttendanceDTO {
  groupId: string;
  groupName: string;
  groupType: GroupType;
  records: StudentAttendanceRecordDTO[];
  presentCount: number;
  absentCount: number;
  totalClasses: number;
  attendancePercentage: number;
}

export type StudentCourseAttendanceDTO = GroupAttendanceDTO[];
