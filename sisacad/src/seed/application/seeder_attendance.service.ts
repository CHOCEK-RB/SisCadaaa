import { Injectable, Inject } from '@nestjs/common';

import { IAttendanceRepository } from 'src/attendance/domain/repositories/iattendance.repository';
import { IAcademicCourseRepository } from 'src/courses/domain/repositories/icourse_academic.repository';

import {
  Attendance,
  AttendanceStatus,
  LocationStatus,
} from 'src/attendance/domain/aggregates/attendance.entity';
import { Student } from 'src/users/domain/aggregates/student.entity';
import { AcademicGroup } from 'src/groups/domain/aggregates/academic_group.entity';

/**
 * @class SeederAttendanceService
 * @description
 * Service responsible for seeding attendance records for academic courses and groups.
 * It generates realistic attendance data, including random student statuses (present/absent)
 * and assigns random class dates within a specified academic period.
 */
@Injectable()
export class SeederAttendanceService {
  /**
   * @constructor
   * @param {IAttendanceRepository} attendanceRepository - Repository for attendance data operations.
   * @param {IAcademicCourseRepository} academicCourseRepository - Repository for academic course data operations.
   */
  constructor(
    @Inject(IAttendanceRepository)
    private readonly attendanceRepository: IAttendanceRepository,
    @Inject(IAcademicCourseRepository)
    private readonly academicCourseRepository: IAcademicCourseRepository,
  ) {}
  /**
   * @method seedAttendance
   * @description
   * Seeds attendance records for academic courses in the 2025-B academic period.
   * It retrieves academic courses, their enrollments, and associated groups.
   * For each group, it generates a random number of class dates within the semester
   * and creates attendance records with random student statuses (present/absent).
   * @returns {Promise<void>} A promise that resolves when all attendance records have been seeded.
   * @private getRandomIP - Generates a random IP address string for attendance records.
   * @private generateClassDates - Generates an array of random class dates within a given range, excluding weekends.
   */
  async seedAttendance(): Promise<void> {
    console.log('Starting attendance seeding for 2025-B...');

    const startDate2025B = new Date('2025-07-30T00:00:00Z');

    const academicCourses2025B =
      await this.academicCourseRepository.findCreatedAfterDate(startDate2025B);

    if (!academicCourses2025B || academicCourses2025B.length === 0) {
      console.log('No academic courses found starting from 2025-B.');
      return;
    }

    const attendancesToCreate: Attendance[] = [];
    const today = new Date();

    const getRandomIP = (): string =>
      `192.168.1.${Math.floor(Math.random() * 254) + 1}`;

    const generateClassDates = (
      count: number,
      startDate: Date,
      endDate: Date,
    ): Date[] => {
      const dates: Date[] = [];
      const startMillis = startDate.getTime();
      const endMillis = Math.min(endDate.getTime(), today.getTime());
      if (startMillis >= endMillis) return [];

      for (let i = 0; i < count; i++) {
        let randomDate: Date;
        let dayOfWeek: number;
        do {
          const randomMillis =
            startMillis + Math.random() * (endMillis - startMillis);
          randomDate = new Date(randomMillis);
          dayOfWeek = randomDate.getUTCDay();
        } while (dayOfWeek === 0 || dayOfWeek === 6);
        dates.push(randomDate);
      }
      return dates.sort((a, b) => a.getTime() - b.getTime());
    };

    for (const ac of academicCourses2025B) {
      if (ac.enrollments.length === 0) {
        console.log(
          `Skipping course ${ac.course?.code || ac.id} - No enrollments found ${ac.course.name}.`,
        );
        continue;
      }

      const studentsByGroup = new Map<string, Student[]>();
      for (const enrollment of ac.enrollments) {
        if (!enrollment.student || !enrollment.groups) continue;
        const student = enrollment.student;
        for (const group of enrollment.groups) {
          if (!studentsByGroup.has(group.id)) {
            studentsByGroup.set(group.id, []);
          }

          if (
            !studentsByGroup.get(group.id)?.some((s) => s.id === student.id)
          ) {
            studentsByGroup.get(group.id)?.push(student);
          }
        }
      }

      const uniqueGroupsInCourse = new Map<string, AcademicGroup>();
      ac.enrollments.forEach((enr) =>
        enr.groups?.forEach((g) => {
          if (g && g.teacher) {
            uniqueGroupsInCourse.set(g.id, g);
          }
        }),
      );

      for (const [groupId, group] of uniqueGroupsInCourse.entries()) {
        const studentsInGroup = studentsByGroup.get(groupId);
        const teacher = group.teacher;

        if (!studentsInGroup || studentsInGroup.length === 0 || !teacher) {
          console.log(
            `Skipping group ${group.name} for course ${ac.course?.code || ac.id} - No students or teacher.`,
          );
          continue;
        }

        const semesterStartDate = new Date('2025-08-01T00:00:00Z');
        const semesterEndDate = new Date('2025-12-20T00:00:00Z');
        const numberOfAttendances = Math.floor(Math.random() * 3) + 8;
        const classDates = generateClassDates(
          numberOfAttendances,
          semesterStartDate,
          semesterEndDate,
        );

        for (const classDate of classDates) {
          const attendance = new Attendance();
          attendance.academicGroup = group;
          attendance.teacher = teacher;
          attendance.classDate = classDate;
          attendance.ipAddress = getRandomIP();
          attendance.location = LocationStatus.UNIVERSITY;
          attendance.studentStatuses = {};

          for (const student of studentsInGroup) {
            const status =
              Math.random() < 0.85
                ? AttendanceStatus.PRESENT
                : AttendanceStatus.ABSENT;
            attendance.studentStatuses[student.id] = status;
          }

          attendancesToCreate.push(attendance);
        }
      }
    }

    try {
      if (attendancesToCreate.length > 0) {
        console.log(
          `Saving ${attendancesToCreate.length} attendance records...`,
        );

        await this.attendanceRepository.save(attendancesToCreate);
        console.log(
          `Successfully created ${attendancesToCreate.length} attendance records.`,
        );
      } else {
        console.log('No attendance records needed to be created.');
      }
    } catch (error) {
      console.error('Failed to save attendance records:', error);
      throw error;
    }
  }
}
