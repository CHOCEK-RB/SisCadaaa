import { Injectable, Inject } from '@nestjs/common';

import * as fs from 'fs';
import * as Papa from 'papaparse';

import * as typeCsv from './csv.types';

import { IUserRepository } from 'src/users/domain/repositories/iuser.repository';
import { IStudentRepository } from 'src/users/domain/repositories/istudent.repository';

import { User } from 'src/users/domain/aggregates/user.entity';
import { Student } from 'src/users/domain/aggregates/student.entity';
import { Role } from 'src/users/domain/aggregates/role.enum';

/**
 * @class SeederStudentService
 * @description
 * Service responsible for seeding student data into the database from a CSV file.
 * It creates user accounts for students and their associated student profiles,
 * including CUI, names, and current semester.
 */
@Injectable()
export class SeederStudentService {
  /**
   * @constructor
   * @param {IUserRepository} userRepository - Repository for user data operations.
   * @param {IStudentRepository} studentRepository - Repository for student data operations.
   */
  constructor(
    @Inject(IUserRepository)
    private readonly userRepository: IUserRepository,
    @Inject(IStudentRepository)
    private readonly studentRepository: IStudentRepository,
  ) {}

  /**
   * @method seedStudents
   * @description
   * Reads student data from a CSV file, parses it, and seeds student profiles into the database.
   * For each student entry, it creates a new user and an associated student profile,
   * ensuring that duplicate users are not created and handling parsing of semester.
   * @param {string} filePath - The path to the CSV file containing student data.
   * @returns {Promise<void>} A promise that resolves when all student data has been processed.
   */
  async seedStudents(filePath: string): Promise<void> {
    const csvFile = fs.readFileSync(filePath, 'utf8');
    const parseResult = Papa.parse<typeCsv.Student>(csvFile, {
      header: true,
      skipEmptyLines: true,
    });

    if (parseResult.errors.length > 0) {
      console.error('Errors parsing CSV:', parseResult.errors);
      throw new Error('Failed to parse CSV file.');
    }

    const studentRows = parseResult.data;

    for (const studentData of studentRows) {
      try {
        let user = await this.userRepository.findByEmail(studentData.email);
        if (user) {
          console.log(
            `User with email ${studentData.email} already exists. Skipping.`,
          );
          continue;
        }

        user = new User();
        user.email = studentData.email;
        user.isActive = true;
        user.role = Role.STUDENT;

        const studentProfile = new Student();
        studentProfile.cui = studentData.cui;
        studentProfile.name = studentData.name;
        studentProfile.firstLastName = studentData.firstLastName;
        studentProfile.secondLastName = studentData.secondLastName;
        studentProfile.semester = parseInt(studentData.semester, 10);
        studentProfile.user = user;

        await this.studentRepository.save(studentProfile);
      } catch (error) {
        if (error instanceof Error) {
          console.error(
            `Failed to process row for ${studentData.email}:`,
            error.message,
          );
        } else {
          console.error(
            `An unknown error occurred for ${studentData.email}:`,
            error,
          );
        }
      }
    }
  }
}
