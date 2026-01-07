import { Injectable, Inject } from "@nestjs/common";

import { IAcademicGroupRepository } from "src/groups/domain/repositories/iacademic_group.repository";
import { IAcademicCourseRepository } from "src/courses/domain/repositories/icourse_academic.repository";
import { ITeacherRepository } from "src/users/domain/repositories/iteacher.repository";

import {
  AcademicGroup,
  GroupType,
} from "src/groups/domain/aggregates/academic_group.entity";
import { AcademicCourse } from "src/courses/domain/aggregates/academic_course.entity";
import { Teacher } from "src/users/domain/aggregates/teacher.entity";

/**
 * @class SeederAcademicGroupsService
 * @description
 * Service responsible for seeding academic groups (Theory, Practice, Laboratory)
 * for academic courses. It assigns teachers to these groups and sets coordinators for courses.
 */
@Injectable()
export class SeederAcademicGroupsService {
  /**
   * @constructor
   * @param {IAcademicGroupRepository} academicGroupRepository - Repository for academic group data operations.
   * @param {IAcademicCourseRepository} academicCourseRepository - Repository for academic course data operations.
   * @param {ITeacherRepository} teacherRepository - Repository for teacher data operations.
   */
  constructor(
    @Inject(IAcademicGroupRepository)
    private readonly academicGroupRepository: IAcademicGroupRepository,
    @Inject(IAcademicCourseRepository)
    private readonly academicCourseRepository: IAcademicCourseRepository,
    @Inject(ITeacherRepository)
    private readonly teacherRepository: ITeacherRepository,
  ) {}
  /**
   * @method seedAcademicGroups
   * @description
   * Seeds academic groups (Theory, Practice, Laboratory) for all existing academic courses.
   * It retrieves all academic courses and teachers, then creates default Theory and Practice
   * groups for each course, assigning random teachers. Laboratory groups are created only
   * for academic courses that are NOT from the latest academic cycle.
   * Also sets a random teacher as the coordinator for each academic course.
   * @returns {Promise<void>} A promise that resolves when all academic groups have been created and courses updated.
   */
  async seedAcademicGroups(): Promise<void> {
    const academicCourses = await this.academicCourseRepository.findAll();
    const allTeachers = await this.teacherRepository.findAll();

    if (!academicCourses || academicCourses.length === 0) {
      console.log("No academic courses found to seed groups.");
      return;
    }
    if (!allTeachers || allTeachers.length === 0) {
      console.log("No teachers found. Cannot assign teachers to groups.");
      return;
    }

    // Determine the latest academic cycle based on creationDate
    const latestCreationDate = academicCourses.reduce((latest, course) => {
      return course.creationDate > latest ? course.creationDate : latest;
    }, new Date(0)); // Initialize with a very old date

    console.log(
      `Latest academic course creation date: ${latestCreationDate.toISOString()}`,
    );

    const groupsToCreate: AcademicGroup[] = [];
    const coursesToUpdate: AcademicCourse[] = [];

    const getRandomTeacher = (): Teacher => {
      return allTeachers[Math.floor(Math.random() * allTeachers.length)];
    };

    console.log(
      `Generating academic groups for ${academicCourses.length} academic courses...`,
    );

    for (const ac of academicCourses) {
      let coordinator = getRandomTeacher();

      if (ac.course.semester == 6) {
        coordinator =
          allTeachers.find(
            (teacher) =>
              teacher.name == "JOSE LUIS" &&
              teacher.firstLastName == "CALIZAYA",
          ) || coordinator;
      }

      const theoryA = new AcademicGroup();
      theoryA.name = "A";
      theoryA.type = GroupType.THEORY;
      theoryA.capacity = 40;
      theoryA.academicCourse = ac;
      theoryA.teacher = coordinator;
      groupsToCreate.push(theoryA);

      const theoryB = new AcademicGroup();
      theoryB.name = "B";
      theoryB.type = GroupType.THEORY;
      theoryB.capacity = 40;
      theoryB.academicCourse = ac;
      theoryB.teacher = getRandomTeacher();
      groupsToCreate.push(theoryB);

      ac.coordinator = coordinator;
      coursesToUpdate.push(ac);

      const practiceA = new AcademicGroup();
      practiceA.name = "A";
      practiceA.type = GroupType.PRACTICE;
      practiceA.capacity = 40;
      practiceA.academicCourse = ac;
      practiceA.teacher = getRandomTeacher();
      groupsToCreate.push(practiceA);

      const practiceB = new AcademicGroup();
      practiceB.name = "B";
      practiceB.type = GroupType.PRACTICE;
      practiceB.capacity = 40;
      practiceB.academicCourse = ac;
      practiceB.teacher = getRandomTeacher();
      groupsToCreate.push(practiceB);

      // Only create lab groups if the academic course is NOT from the latest academic cycle
      if (ac.creationDate.getTime() !== latestCreationDate.getTime()) {
        const labGroupNames = ["A", "B", "C"];
        for (let i = 0; i < labGroupNames.length; i++) {
          const labGroup = new AcademicGroup();
          labGroup.name = labGroupNames[i];
          labGroup.type = GroupType.LABORATORY;
          labGroup.capacity = 20;
          labGroup.academicCourse = ac;
          labGroup.teacher = getRandomTeacher();
          groupsToCreate.push(labGroup);
        }
      } else {
        console.log(
          `Skipping lab group creation for course ${ac.course.name} (${ac.id}) in latest academic cycle.`,
        );
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
      console.error("Failed to save academic groups or update courses:", error);
    }
  }
}
