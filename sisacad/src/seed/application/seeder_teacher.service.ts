import { Injectable, Inject } from '@nestjs/common';

import * as fs from 'fs';
import * as Papa from 'papaparse';

import * as typeCsv from './csv.types';

import { IUserRepository } from 'src/users/domain/repositories/iuser.repository';
import { ITeacherRepository } from 'src/users/domain/repositories/iteacher.repository';

import { User } from 'src/users/domain/aggregates/user.entity';
import { Teacher } from 'src/users/domain/aggregates/teacher.entity';

/**
 * @class SeederTeacherService
 * @description
 * Service responsible for seeding teacher data into the database from a CSV file.
 * It creates user accounts for teachers and their associated teacher profiles.
 */
@Injectable()
export class SeederTeacherService {
  /**
   * @constructor
   * @param {IUserRepository} userRepository - Repository for user data operations.
   * @param {ITeacherRepository} teacherRepository - Repository for teacher data operations.
   */
  constructor(
    @Inject(IUserRepository)
    private readonly userRepository: IUserRepository,
    @Inject(ITeacherRepository)
    private readonly teacherRepository: ITeacherRepository,
  ) {}

  /**
   * @method seedTeachers
   * @description
   * Reads teacher data from a CSV file, parses it, and seeds teacher profiles into the database.
   * For each teacher entry, it creates a new user and an associated teacher profile,
   * ensuring that duplicate users are not created.
   * @param {string} filePath - The path to the CSV file containing teacher data.
   * @returns {Promise<void>} A promise that resolves when all teacher data has been processed.
   */
  async seedTeachers(filePath: string): Promise<void> {
    const csvFile = fs.readFileSync(filePath, 'utf8');
    const parseResult = Papa.parse<typeCsv.Teacher>(csvFile, {
      header: true,
      skipEmptyLines: true,
    });

    if (parseResult.errors.length > 0) {
      console.error('Errors parsing CSV:', parseResult.errors);
      throw new Error('Failed to parse CSV file.');
    }

    const teacherRows = parseResult.data;

    for (const teacherData of teacherRows) {
      try {
        let user = await this.userRepository.findByEmail(teacherData.email);
        if (user) {
          console.log(
            `User with email ${teacherData.email} already exists. Skipping.`,
          );
          continue;
        }

        user = new User();
        user.email = teacherData.email;
        user.isActive = true;

        const teacherProfile = new Teacher();
        teacherProfile.name = teacherData.name;
        teacherProfile.firstLastName = teacherData.firstLastName;
        teacherProfile.secondLastName = teacherData.secondLastName;
        teacherProfile.user = user;

        await this.teacherRepository.save(teacherProfile);
      } catch (error) {
        if (error instanceof Error) {
          console.error(
            `Failed to process row for ${teacherData.email}:`,
            error.message,
          );
        } else {
          console.error(
            `An unknown error occurred for ${teacherData.email}:`,
            error,
          );
        }
      }
    }
  }
}
