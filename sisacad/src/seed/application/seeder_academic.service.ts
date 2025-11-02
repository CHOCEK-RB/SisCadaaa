import { Injectable, Inject } from '@nestjs/common';

import { AcademicCourse } from 'src/courses/aggregates/academic_course.entity';
import {
  AcademicGroup,
  GroupType,
} from 'src/groups/aggregates/academic_group.entity';
import { Teacher } from 'src/users/aggregates/teacher.entity';
import { Student } from 'src/users/aggregates/student.entity';
import {
  Enrollment,
  EnrollmentStatus,
} from 'src/enrollment/aggregates/enrollment.entity';
import {
  Attendance,
  LocationStatus,
  AttendanceStatus,
} from 'src/attendance/aggregates/attendance.entity';

import { ISeederServiceAcademic } from './iseeder_academic.service';

import { ICourseRepository } from 'src/courses/infrastructure/icourse.repository';
import { IAcademicCourseRepository } from 'src/courses/infrastructure/icourse_academic.repository';
import { IAcademicGroupRepository } from 'src/groups/infrastructure/iacademic_group.repository';
import { ITeacherRepository } from 'src/users/infrastructure/iteacher.repository';
import { IStudentRepository } from 'src/users/infrastructure/istudent.repository';
import { IEnrollmentRepository } from 'src/enrollment/infrastructure/ienrollment.repository';
import { IAttendanceRepository } from 'src/attendance/infrastructure/iattendance.repository';

@Injectable()
export class SeeederServiceAcademic implements ISeederServiceAcademic {
  constructor(
    @Inject(ICourseRepository)
    private readonly courseRepository: ICourseRepository,
    @Inject(IAcademicCourseRepository)
    private readonly academicCourseRepository: IAcademicCourseRepository,
    @Inject(IAcademicGroupRepository)
    private readonly academicGroupRepository: IAcademicGroupRepository,
    @Inject(ITeacherRepository)
    private readonly teacherRepository: ITeacherRepository,
    @Inject(IStudentRepository)
    private readonly studentRepository: IStudentRepository,
    @Inject(IEnrollmentRepository)
    private readonly enrollmentRepository: IEnrollmentRepository,
    @Inject(IAttendanceRepository)
    private readonly attendanceRepository: IAttendanceRepository,
  ) {}

  async seedAcademicCourses(): Promise<void> {
    const courses = await this.courseRepository.findAll();

    if (!courses || courses.length === 0) {
      console.log('No courses found in the catalog to seed academic courses.');
      return;
    }

    const academicCoursesToCreate: AcademicCourse[] = [];

    for (const course of courses) {
      for (let i = 0; i < 10 - course.semester + 1; i += 2) {
        const academicCourse = new AcademicCourse();
        academicCourse.course = course;

        const currentYear = 2025 - Math.floor((10 - course.semester - i) / 2);

        const isFirstSemester = (course.semester + i) % 2 !== 0;

        if (isFirstSemester) {
          academicCourse.creationDate = new Date(`${currentYear}-03-01`);
        } else {
          academicCourse.creationDate = new Date(`${currentYear}-08-01`);
        }

        academicCourse.grades = {
          firstContinue: 15,
          secondContinue: 15,
          thirdContinue: 20,
          firstPartial: 15,
          secondPartial: 15,
          thirdPartial: 20,
        };

        academicCoursesToCreate.push(academicCourse);
      }
    }

    try {
      if (academicCoursesToCreate.length > 0) {
        await this.academicCourseRepository.save(academicCoursesToCreate);
        console.log(
          `Successfully created ${academicCoursesToCreate.length} academic course offerings.`,
        );
      } else {
        console.log('No new academic course offerings to create.');
      }
    } catch (error) {
      console.error('Failed to save academic courses:', error);
    }
  }
  async seedAcademicGroups(): Promise<void> {
    const academicCourses = await this.academicCourseRepository.findAll();
    const allTeachers = await this.teacherRepository.findAll();

    if (!academicCourses || academicCourses.length === 0) {
      console.log('No academic courses found to seed groups.');
      return;
    }
    if (!allTeachers || allTeachers.length === 0) {
      console.log('No teachers found. Cannot assign teachers to groups.');
      return;
    }

    const groupsToCreate: AcademicGroup[] = [];
    const coursesToUpdate: AcademicCourse[] = [];

    const getRandomTeacher = (): Teacher => {
      return allTeachers[Math.floor(Math.random() * allTeachers.length)];
    };

    console.log(
      `Generating academic groups for ${academicCourses.length} academic courses...`,
    );

    for (const ac of academicCourses) {
      const coordinator = getRandomTeacher();
      const theoryA = new AcademicGroup();
      theoryA.name = 'A';
      theoryA.type = GroupType.THEORY;
      theoryA.capacity = 40;
      theoryA.academicCourse = ac;
      theoryA.teacher = coordinator;
      groupsToCreate.push(theoryA);

      const theoryB = new AcademicGroup();
      theoryB.name = 'B';
      theoryB.type = GroupType.THEORY;
      theoryB.capacity = 40;
      theoryB.academicCourse = ac;
      theoryB.teacher = getRandomTeacher();
      groupsToCreate.push(theoryB);

      ac.coordinator = coordinator;
      coursesToUpdate.push(ac);

      const practiceA = new AcademicGroup();
      practiceA.name = 'A';
      practiceA.type = GroupType.PRACTICE;
      practiceA.capacity = 40;
      practiceA.academicCourse = ac;
      practiceA.teacher = getRandomTeacher();
      groupsToCreate.push(practiceA);

      const practiceB = new AcademicGroup();
      practiceB.name = 'B';
      practiceB.type = GroupType.PRACTICE;
      practiceB.capacity = 40;
      practiceB.academicCourse = ac;
      practiceB.teacher = getRandomTeacher();
      groupsToCreate.push(practiceB);

      const labGroupCount = Math.random() < 0.5 ? 2 : 3;
      const labGroupNames = ['A', 'B', 'C'];
      for (let i = 0; i < labGroupCount; i++) {
        const labGroup = new AcademicGroup();
        labGroup.name = labGroupNames[i];
        labGroup.type = GroupType.LABORATORY;
        labGroup.capacity = 20;
        labGroup.academicCourse = ac;
        labGroup.teacher = getRandomTeacher();
        groupsToCreate.push(labGroup);
      }
    }

    try {
      if (groupsToCreate.length > 0) {
        await this.academicGroupRepository.save(groupsToCreate);
        console.log(
          `Successfully created ${groupsToCreate.length} academic groups.`,
        );
      }
      if (coursesToUpdate.length > 0) {
        await this.academicCourseRepository.save(coursesToUpdate);
        console.log(
          `Updated coordinators for ${coursesToUpdate.length} academic courses.`,
        );
      }
    } catch (error) {
      console.error('Failed to save academic groups or update courses:', error);
    }
  }

  async seedEnrollment(): Promise<void> {
    const academicCourses = await this.academicCourseRepository.findAll();
    const students = await this.studentRepository.findAll();

    if (!academicCourses || academicCourses.length === 0) {
      console.log('No academic courses found to seed enrollments.');
      return;
    }
    if (!students || students.length === 0) {
      console.log('No students found. Cannot assign students to enrollments.');
      return;
    }

    academicCourses.forEach((ac) => {
      if (typeof ac.creationDate === 'string') {
        ac.creationDate = new Date(ac.creationDate);
      }
    });

    const enrollmentsToCreate: Partial<Enrollment>[] = [];
    const currentBaseYear = 2025;

    for (const student of students) {
      const yearsSinceStart = Math.floor((student.semester - 1) / 2);
      const startYear = currentBaseYear - yearsSinceStart;

      for (
        let targetSemester = 1;
        targetSemester - 1 < student.semester;
        targetSemester++
      ) {
        const yearsToAdd = Math.floor((targetSemester - 1) / 2);
        const targetYear = startYear + yearsToAdd;
        const isFirstAcademicSemester = targetSemester % 2 !== 0;
        const targetMonth = isFirstAcademicSemester ? 3 : 8;

        const relevantAcademicCourses = academicCourses.filter(
          (ac) =>
            ac.course &&
            ac.course.semester === targetSemester &&
            ac.creationDate instanceof Date &&
            ac.creationDate.getUTCFullYear() === targetYear &&
            ac.creationDate.getUTCMonth() === targetMonth - 1,
        );

        if (
          targetYear === 2025 &&
          targetMonth === 8 &&
          targetSemester % 2 === 1
        ) {
          console.log(relevantAcademicCourses);
        }

        if (relevantAcademicCourses.length === 0) {
          console.log(
            `No relevant academic courses found for student ${student.cui} in target semester ${targetSemester}. Skipping...`,
          );
          continue;
        }

        let groupName = Math.random() < 0.5 ? 'A' : 'B';
        if (student.cui === '20233595') {
          groupName = 'A';
        }

        for (const ac of relevantAcademicCourses) {
          let groups: AcademicGroup[] = [];
          try {
            groups = ac.groups instanceof Promise ? await ac.groups : ac.groups;
          } catch (e) {
            console.error(`Error fetching groups for AC ${ac.id}: `, e);
            continue;
          }

          if (!Array.isArray(groups)) {
            console.warn(`Groups for AC ${ac.id} is not an array. Skipping.`);
            continue;
          }

          const availableTheoryGroups = groups.filter(
            (g) => g.type === GroupType.THEORY,
          );
          const availablePracticeGroups = groups.filter(
            (g) => g.type === GroupType.PRACTICE,
          );
          const availableLabGroups = groups.filter(
            (g) => g.type === GroupType.LABORATORY,
          );

          const theoryGroup =
            availableTheoryGroups.find((g) => g.name === groupName) ||
            availableTheoryGroups[0];
          const practiceGroup =
            availablePracticeGroups.find((g) => g.name === groupName) ||
            availablePracticeGroups[0];
          const labGroup =
            availableLabGroups.find((g) => g.name === groupName) ||
            availableLabGroups[0];

          const assignedGroupIds: { id: string }[] = [];
          if (theoryGroup) assignedGroupIds.push({ id: theoryGroup.id });
          if (practiceGroup) assignedGroupIds.push({ id: practiceGroup.id });
          if (labGroup) assignedGroupIds.push({ id: labGroup.id });

          if (assignedGroupIds.length === 0) {
            console.warn(
              `Skipping enrollment for ${student.cui} in course ${ac.course?.code || ac.id} (${targetYear}-${isFirstAcademicSemester ? 'A' : 'B'}) - No suitable groups found for '${groupName}'. Available groups: ${groups.map((g) => `${g.name}-${g.type}`).join(', ')}`,
            );
            continue;
          }

          const enrollmentData: Partial<Enrollment> = {
            student: { id: student.id } as Student,
            course: { id: ac.id } as AcademicCourse,
            groups: assignedGroupIds as AcademicGroup[],
            date: ac.creationDate.toISOString(),
            status:
              targetSemester < student.semester
                ? EnrollmentStatus.INACTIVE
                : EnrollmentStatus.ACTIVE,
            grades: {
              firstContinue: Math.floor(Math.random() * 10) + 11,
              secondConitnue: Math.floor(Math.random() * 10) + 11,
              thirdContinue: Math.floor(Math.random() * 10) + 11,
              firstPartial: Math.floor(Math.random() * 10) + 11,
              secondPartial: Math.floor(Math.random() * 10) + 11,
              thirdPartial: Math.floor(Math.random() * 10) + 11,
            },
          };

          enrollmentsToCreate.push(enrollmentData);
        }
      }

      console.log(
        `Prepared ${enrollmentsToCreate.length} potential enrollments for student ${student.cui}.`,
      );
    }

    try {
      if (enrollmentsToCreate.length > 0) {
        const BATCH_SIZE = 1000;

        console.log(
          `\nSaving ${enrollmentsToCreate.length} total enrollments in batches of ${BATCH_SIZE}...`,
        );

        for (let i = 0; i < enrollmentsToCreate.length; i += BATCH_SIZE) {
          const batch = enrollmentsToCreate.slice(i, i + BATCH_SIZE);
          console.log(
            `Processing batch ${i / BATCH_SIZE + 1} (${batch.length} items)...`,
          );

          await this.enrollmentRepository.save(batch as Enrollment[]);
        }

        console.log(
          `Successfully created all ${enrollmentsToCreate.length} enrollments.`,
        );
      } else {
        console.log('No new enrollments needed to be created.');
      }
    } catch (error) {
      console.error('Failed to save enrollments:', error);
      throw error;
    }
  }
  async seedAttendance(): Promise<void> {
    console.log('Starting attendance seeding for 2025-B...');

    const startDate2025B = new Date('2025-07-30T00:00:00Z');

    const academicCourses2025B =
      await this.academicCourseRepository.findCreatedAfterDate(startDate2025B);

    console.log(academicCourses2025B);

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

  async runAll(): Promise<void> {
    await this.seedAcademicCourses();
    await this.seedAcademicGroups();
    await this.seedEnrollment();
    await this.seedAttendance();
    return;
  }
}
