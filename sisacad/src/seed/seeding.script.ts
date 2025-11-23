import { NestFactory } from '@nestjs/core';
import { SeedingModule } from './seeding.module';
import { SeederStudentService } from './application/seeder_student.service';
import { SeederTeacherService } from './application/seeder_teacher.service';
import { SeederCoursesService } from './application/seeder_courses.service';
import { SeederTopicsService } from './application/seeder_topics.service';
import { SeederScheduleService } from './application/seeder_schedule.service';
import { SeederClassroomsService } from './application/seeder_classrooms.service';
import { SeederAcademicCoursesService } from './application/seeder_academic_courses.service';
import { SeederAcademicGroupsService } from './application/seeder_academic_groups.service';
import { SeederEnrollmentService } from './application/seeder_enrollment.service';
import { SeederAttendanceService } from './application/seeder_attendance.service';
import { SeederTopicProgressService } from './application/seeder_topic_progress.service';
import { SeederEventsService } from './application/seeder_events.service';

async function bootstrap() {
  const appContext = await NestFactory.createApplicationContext(SeedingModule);

  try {
    console.log('Seeding started...');
    console.log('Seeding students...');
    const seeder = appContext.get(SeederStudentService);
    await seeder.seedStudents('students.csv');

    console.log('Seeding teachers...');
    const seederTeacher = appContext.get(SeederTeacherService);
    await seederTeacher.seedTeachers('teachers.csv');

    console.log('Seeding courses...');
    const seederCourses = appContext.get(SeederCoursesService);
    await seederCourses.seedCourses('courses.csv');

    console.log('Seeding classrooms...');
    const seederClassrooms = appContext.get(SeederClassroomsService);
    await seederClassrooms.seedClassrooms('classrooms.csv');

    console.log('Seeding global events...');
    const seederEvents = appContext.get(SeederEventsService);
    await seederEvents.seedEvents();

    console.log('Seeding academic courses...');
    const seederAcademicCourses = appContext.get(SeederAcademicCoursesService);
    await seederAcademicCourses.seedAcademicCourses();

    console.log('Seeding academic groups...');
    const seederAcademicGroups = appContext.get(SeederAcademicGroupsService);
    await seederAcademicGroups.seedAcademicGroups();

    console.log('Seeding enrollments...');
    const seederEnrollment = appContext.get(SeederEnrollmentService);
    await seederEnrollment.seedEnrollment();

    console.log('Seeding attendances...');
    const seederAttendance = appContext.get(SeederAttendanceService);
    await seederAttendance.seedAttendance();

    console.log('Seeding topics...');
    const seederTopics = appContext.get(SeederTopicsService);
    await seederTopics.seedTopics('topics.csv');

    console.log('Seeding topic progress...');
    const seederTopicProgress = appContext.get(SeederTopicProgressService);
    await seederTopicProgress.seedTopicProgress();

    console.log('Seeding schedule...');
    const seederSchedule = appContext.get(SeederScheduleService);
    await seederSchedule.seedSchedule('schedule.csv');
  } catch (error) {
    console.error('Seeding failed:', error);
    throw error;
  } finally {
    console.log('Closing application context...');
    await appContext.close();
  }
}
bootstrap().catch((error) => {
  console.error(
    'An unhandled error occurred during the seeding process:',
    error,
  );
  process.exit(1);
});

