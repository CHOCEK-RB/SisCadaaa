import { Injectable, Inject } from '@nestjs/common';

import * as fs from 'fs';
import * as Papa from 'papaparse';

import * as typeCsv from './csv.types';

import { IClassroomRepository } from 'src/classroom/domain/repositories/iclassroom.repository';
import { IAcademicGroupRepository } from 'src/groups/domain/repositories/iacademic_group.repository';
import { IScheduleSlotRepository } from 'src/groups/domain/repositories/ischedule.repository';
import { IAcademicCourseRepository } from 'src/courses/domain/repositories/icourse_academic.repository'; // New Import
import { ITeacherRepository } from 'src/users/domain/repositories/iteacher.repository'; // New Import

import {
  ScheduleSlot,
  DayOfWeek,
} from 'src/groups/domain/aggregates/schedule.entity';
import {
  AcademicGroup,
  GroupType,
} from 'src/groups/domain/aggregates/academic_group.entity'; // New Import
import { AcademicCourse } from 'src/courses/domain/aggregates/academic_course.entity'; // New Import
import { Teacher } from 'src/users/domain/aggregates/teacher.entity'; // New Import

/**
 * @class SeederScheduleService
 * @description
 * Service responsible for seeding schedule slots into the database from a CSV file.
 * It reads schedule data, creates or identifies academic groups, and assigns classrooms
 * and teachers to create detailed schedule entries.
 */
@Injectable()
export class SeederScheduleService {
  /**
   * @constructor
   * @param {IClassroomRepository} classroomRepository - Repository for classroom data operations.
   * @param {IAcademicGroupRepository} academicGroupRepository - Repository for academic group data operations.
   * @param {IScheduleSlotRepository} scheduleSlotRepository - Repository for schedule slot data operations.
   * @param {IAcademicCourseRepository} academicCourseRepository - Repository for academic course data operations.
   * @param {ITeacherRepository} teacherRepository - Repository for teacher data operations.
   */
  constructor(
    @Inject(IClassroomRepository)
    private readonly classroomRepository: IClassroomRepository,
    @Inject(IAcademicGroupRepository)
    private readonly academicGroupRepository: IAcademicGroupRepository,
    @Inject(IScheduleSlotRepository)
    private readonly scheduleSlotRepository: IScheduleSlotRepository,
    @Inject(IAcademicCourseRepository) // New Injection
    private readonly academicCourseRepository: IAcademicCourseRepository,
    @Inject(ITeacherRepository) // New Injection
    private readonly teacherRepository: ITeacherRepository,
  ) {}

  /**
   * @method seedSchedule
   * @description
   * Reads schedule data from a CSV file, parses it, and seeds schedule slots into the database.
   * It handles the creation of new laboratory groups if they don't exist for a given academic course and period,
   * and assigns random teachers to newly created groups.
   * @param {string} filePath - The path to the CSV file containing schedule data.
   * @returns {Promise<void>} A promise that resolves when all schedule slots have been processed.
   * @throws {Error} If there are errors parsing the CSV file or if required entities (e.g., classrooms, academic courses) are not found.
   */
  async seedSchedule(filePath: string): Promise<void> {
    const csvFile = fs.readFileSync(filePath, 'utf8');
    const parseResult = Papa.parse<typeCsv.ScheduleSlot>(csvFile, {
      header: true,
      skipEmptyLines: true,
    });

    if (parseResult.errors.length > 0) {
      console.error('Errors parsing CSV:', parseResult.errors);
      throw new Error('Failed to parse CSV file.');
    }

    const scheduleRows = parseResult.data;

    const allTeachers = await this.teacherRepository.findAll(); // Get all teachers
    if (!allTeachers || allTeachers.length === 0) {
      console.log('No teachers found. Cannot assign teachers to groups.');
      return;
    }
    const getRandomTeacher = (): Teacher => {
      return allTeachers[Math.floor(Math.random() * allTeachers.length)];
    };

    const allAcademicCourses = await this.academicCourseRepository.findAll(); // Fetch all academic courses once
    if (!allAcademicCourses || allAcademicCourses.length === 0) {
      console.log('No academic courses found. Cannot create groups.');
      return;
    }

    for (const scheduleData of scheduleRows) {
      try {
        const groupType: GroupType =
          GroupType[
            scheduleData.groupType.toUpperCase() as keyof typeof GroupType
          ];

        const classroom = await this.classroomRepository.findByName(
          scheduleData.classroomName,
        );

        if (!classroom) {
          throw new Error(`Classroom ${scheduleData.classroomName} not found.`);
        }

        let group: AcademicGroup | undefined;
        let groups = await this.academicGroupRepository.findByCourseCodeTypeName(
          scheduleData.courseCode,
          groupType,
          scheduleData.groupName,
        );

        // Filter for a specific academic cycle (August 2025) - Last Academic Cycle
        const targetedGroups = groups?.filter((g) => {
          if (!g.academicCourse) return false;
          const creationDate = new Date(g.academicCourse.creationDate);
          const year = creationDate.getUTCFullYear();
          const month = creationDate.getUTCMonth();
          return year === 2025 && month === 7; // August 2025
        });

        if (groupType === GroupType.LABORATORY) {
          if (!targetedGroups || targetedGroups.length === 0) {
            // No existing lab group found, create one
            console.log(
              `Creating new LAB group for course ${scheduleData.courseCode}, name ${scheduleData.groupName}`,
            );
            const academicCourse = allAcademicCourses.find(
              (ac) => ac.course.code === scheduleData.courseCode && ac.creationDate.getUTCFullYear() === 2025 && ac.creationDate.getUTCMonth() === 7
            );
            if (!academicCourse) {
              throw new Error(
                `AcademicCourse ${scheduleData.courseCode} not found for lab group creation in August 2025.`,
              );
            }

            const newLabGroup = new AcademicGroup();
            newLabGroup.name = scheduleData.groupName;
            newLabGroup.type = GroupType.LABORATORY;
            newLabGroup.capacity = 20; // Default capacity for lab groups
            newLabGroup.academicCourse = academicCourse;
            newLabGroup.teacher = getRandomTeacher(); // Assign a random teacher
            group = await this.academicGroupRepository.save(newLabGroup); // Save the new group
          } else {
            group = targetedGroups[0]; // Use the first found group
          }
        } else {
          // For THEORY and PRACTICE groups, we expect them to exist
          if (!targetedGroups || targetedGroups.length === 0) {
            console.warn(
              `Skipping row: No ${groupType} groups found for course ${scheduleData.courseCode}, name ${scheduleData.groupName} in targeted academic cycle.`,
            );
            continue;
          }
          group = targetedGroups[0];
        }

        if (!group) {
          continue; // Should not happen if logic is correct
        }

        const dayEnum =
          DayOfWeek[scheduleData.day.toUpperCase() as keyof typeof DayOfWeek];

        const slot = new ScheduleSlot();
        slot.day = dayEnum;
        slot.startTime = scheduleData.startTime;
        slot.endTime = scheduleData.endTime;
        slot.classroom = classroom;
        slot.academicGroup = group;

        await this.scheduleSlotRepository.save(slot);

        console.log(
          `Creating schedule for: ${group.academicCourse.course.name} (${group.academicCourse.course.code}) | Group: ${group.name} (${group.type}) | Day: ${scheduleData.day} | Time: ${scheduleData.startTime}-${scheduleData.endTime}`,
        );
      } catch (error) {
        console.warn(`Skipping row due to error: ${error}`);
      }
    }

    console.log('Finished seeding schedule slots from CSV');
  }
}
