import { Injectable, Inject } from '@nestjs/common';

import { AcademicCourse } from 'src/courses/aggregates/academic_course.entity';
import {
  AcademicGroup,
  GroupType,
} from 'src/groups/aggregates/academic_group.entity';
import { Teacher } from 'src/users/aggregates/teacher.entity';
import { Student } from 'src/users/aggregates/student.entity';
import { Enrollment } from 'src/enrollment/aggregates/enrollment.entity';

import { ISeederServiceAcademic } from './iseeder_academic.service';

import { ICourseRepository } from 'src/courses/infrastructure/icourse.repository';
import { IAcademicCourseRepository } from 'src/courses/infrastructure/icourse_academic.repository';
import { IAcademicGroupRepository } from 'src/groups/infrastructure/iacademic_group.repository';
import { ITeacherRepository } from 'src/users/infrastructure/iteacher.repository';
import { IStudentRepository } from 'src/users/infrastructure/istudent.repository';
import { IEnrollmentRepository } from 'src/enrollment/infrastructure/ienrollment.repository';

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
  ) {}

  async seedAcademicCourses(): Promise<void> {
    const courses = await this.courseRepository.findAll();

    if (!courses || courses.length === 0) {
      console.log('No courses found in the catalog to seed academic courses.');
      return;
    }

    const academicCoursesToCreate: AcademicCourse[] = [];

    for (const course of courses) {
      for (let i = 0; i < 10 - course.semester + 1; i++) {
        const academicCourse = new AcademicCourse();
        academicCourse.course = course;

        const currentYear = 2025 - Math.floor((10 - course.semester - i) / 2);
        const isFirstSemester = (course.semester + i) % 2 !== 0;

        if (isFirstSemester) {
          academicCourse.creationDate = new Date(`${currentYear}-03-01`);
        } else {
          academicCourse.creationDate = new Date(`${currentYear}-08-01`);
        }

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
      console.log('No students found. Cannot assign students to groups.');
      return;
    }

    const enrollmentsToCreate: Partial<Enrollment>[] = [];
    const currentBaseYear = 2025;

    for (const student of students) {
      if (student.semester % 2 !== 0 || student.semester < 2) continue;

      for (
        let targetSemester = 1;
        targetSemester < student.semester;
        targetSemester++
      ) {
        const yearOffset = Math.floor(
          (student.semester - targetSemester + 1) / 2,
        );
        const targetYear = currentBaseYear - yearOffset;
        const isFirstAcademicSemester = targetSemester % 2 !== 0;
        const targetMonth = isFirstAcademicSemester ? 3 : 8;

        const relevantAcademicCourses = academicCourses.filter(
          (ac) =>
            ac.course.semester === targetSemester &&
            ac.creationDate.getFullYear() === targetYear &&
            ac.creationDate.getUTCMonth() === targetMonth - 1,
        );

        console.log(`Test length: ${relevantAcademicCourses.length}`);

        const groupName = Math.random() < 0.5 ? 'A' : 'B';

        for (const ac of relevantAcademicCourses) {
          const groups = await ac.groups;

          const theoryGroup = groups.find(
            (g) => g.type === GroupType.THEORY && g.name === groupName,
          );
          const practiceGroup = groups.find(
            (g) => g.type === GroupType.PRACTICE && g.name === groupName,
          );

          const assignedGroupIds: { id: string }[] = [];
          if (theoryGroup) assignedGroupIds.push({ id: theoryGroup.id });
          if (practiceGroup) assignedGroupIds.push({ id: practiceGroup.id });

          if (assignedGroupIds.length === 0) {
            console.warn(
              `Skipping enrollment for ${student.id} in course ${ac.course.id} - No groups found.`,
            );
            continue;
          }

          const enrollmentData: Partial<Enrollment> = {
            student: { id: student.id } as Student,
            course: { id: ac.id } as AcademicCourse,
            groups: assignedGroupIds as AcademicGroup[],
            date: ac.creationDate.toISOString(),
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
        `Created ${enrollmentsToCreate.length} enrollments for student ${student.cui}.`,
      );
    }

    try {
      if (enrollmentsToCreate.length > 0) {
        console.log('Saving enrollments...');
        await this.enrollmentRepository.save(
          enrollmentsToCreate as Enrollment[],
        );
        console.log(
          `Successfully created ${enrollmentsToCreate.length} enrollments.`,
        );
      } else {
        console.log('No new enrollments needed.');
      }
    } catch (error) {
      console.error('Failed to save enrollments:', error);
      throw error;
    }
  }
  async runAll(): Promise<void> {
    await this.seedAcademicCourses();
    await this.seedAcademicGroups();
    await this.seedEnrollment();
    return;
  }
}
