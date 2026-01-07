import { Injectable, Inject } from "@nestjs/common";

import { IEnrollmentRepository } from "src/enrollment/domain/repositories/ienrollment.repository";
import { IAcademicCourseRepository } from "src/courses/domain/repositories/icourse_academic.repository";
import { IStudentRepository } from "src/users/domain/repositories/istudent.repository";

import {
  Enrollment,
  EnrollmentStatus,
} from "src/enrollment/domain/aggregates/enrollment.entity";
import { Student } from "src/users/domain/aggregates/student.entity";
import { AcademicCourse } from "src/courses/domain/aggregates/academic_course.entity";
import {
  AcademicGroup,
  GroupType,
} from "src/groups/domain/aggregates/academic_group.entity";

/**
 * @class SeederEnrollmentService
 * @description
 * Service responsible for seeding student enrollments into academic courses and groups.
 * It simulates student progression through semesters, assigning them to relevant courses
 * and generating mock grades.
 */
@Injectable()
export class SeederEnrollmentService {
  /**
   * @constructor
   * @param {IEnrollmentRepository} enrollmentRepository - Repository for enrollment data operations.
   * @param {IAcademicCourseRepository} academicCourseRepository - Repository for academic course data operations.
   * @param {IStudentRepository} studentRepository - Repository for student data operations.
   */
  constructor(
    @Inject(IEnrollmentRepository)
    private readonly enrollmentRepository: IEnrollmentRepository,
    @Inject(IAcademicCourseRepository)
    private readonly academicCourseRepository: IAcademicCourseRepository,
    @Inject(IStudentRepository)
    private readonly studentRepository: IStudentRepository,
  ) {}
  /**
   * @method seedEnrollment
   * @description
   * Seeds enrollment data for all students across all relevant academic courses.
   * It iterates through students, calculates their academic history based on their current semester,
   * assigns them to appropriate theory and practice groups, and generates mock grades.
   * Special handling is included for filtering courses by academic cycle and assigning groups.
   * Enrollment data is saved in batches to optimize performance.
   * @returns {Promise<void>} A promise that resolves when all enrollments have been seeded.
   * @throws {Error} If there is a failure during the enrollment saving process.
   */
  async seedEnrollment(): Promise<void> {
    const academicCourses = await this.academicCourseRepository.findAllWithGroups();
    const students = await this.studentRepository.findAll();

    if (!academicCourses || academicCourses.length === 0) {
      console.log("No academic courses found to seed enrollments.");
      return;
    }
    if (!students || students.length === 0) {
      console.log("No students found. Cannot assign students to enrollments.");
      return;
    }

    academicCourses.forEach((ac) => {
      if (typeof ac.creationDate === "string") {
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
        const targetMonth = isFirstAcademicSemester ? 2 : 8;

        const relevantAcademicCourses = academicCourses.filter(
          (ac) =>
            ac.course &&
            ac.course.semester === targetSemester &&
            ac.creationDate instanceof Date &&
            ac.creationDate.getUTCFullYear() === targetYear &&
            ac.creationDate.getUTCMonth() === targetMonth - 1,
        );

        if (relevantAcademicCourses.length === 0) {
          console.log(
            `No relevant academic courses found for student ${student.cui} in target semester ${targetSemester}. Skipping...`,
          );
          continue;
        }

        let groupName = Math.random() < 0.5 ? "A" : "B";
        if (student.cui === "20233595") {
          groupName = "A";
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

          const theoryGroup =
            availableTheoryGroups.find((g) => g.name === groupName) ||
            availableTheoryGroups[0];
          const practiceGroup =
            availablePracticeGroups.find((g) => g.name === groupName) ||
            availablePracticeGroups[0];

          const assignedGroupIds: { id: string }[] = [];
          if (theoryGroup) assignedGroupIds.push({ id: theoryGroup.id });
          if (practiceGroup) assignedGroupIds.push({ id: practiceGroup.id });

          if (assignedGroupIds.length === 0) {
            console.warn(
              `Skipping enrollment for ${student.cui} in course ${ac.course?.code || ac.id} (${targetYear}-${isFirstAcademicSemester ? "A" : "B"}) - No suitable groups found for '${groupName}'. Available groups: ${groups.map((g) => `${g.name}-${g.type}`).join(", ")}`,
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
            grades:
              targetSemester < student.semester
                ? {
                    firstContinue: Math.floor(Math.random() * 10) + 9,
                    secondContinue: Math.floor(Math.random() * 10) + 9,
                    thirdContinue: Math.floor(Math.random() * 10) + 9,
                    firstPartial: Math.floor(Math.random() * 10) + 9,
                    secondPartial: Math.floor(Math.random() * 10) + 9,
                    thirdPartial: Math.floor(Math.random() * 10) + 9,
                  }
                : {
                    firstContinue: Math.floor(Math.random() * 10) + 9,
                    secondContinue: Math.floor(Math.random() * 10) + 9,
                    thirdContinue: null,
                    firstPartial: Math.floor(Math.random() * 10) + 9,
                    secondPartial: Math.floor(Math.random() * 10) + 9,
                    thirdPartial: null,
                  },
          };

          enrollmentsToCreate.push(enrollmentData);
        }
      }
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
        console.log("No new enrollments needed to be created.");
      }
    } catch (error) {
      console.error("Failed to save enrollments:", error);
      throw error;
    }
  }
}
