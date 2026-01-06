import { Injectable, Inject } from '@nestjs/common';

import * as fs from 'fs';
import * as Papa from 'papaparse';

import * as typeCsv from './csv.types';

import { IClassroomRepository } from 'src/classroom/domain/repositories/iclassroom.repository';

import {
  Classroom,
  ClassroomType,
} from 'src/classroom/domain/aggregates/classroom.entity';

/**
 * @class SeederClassroomsService
 * @description
 * Service responsible for seeding classroom data into the database from a CSV file.
 * It creates new classroom entities, including their name, location, and type (normal or laboratory).
 */
@Injectable()
export class SeederClassroomsService {
  /**
   * @constructor
   * @param {IClassroomRepository} classroomRepository - Repository for classroom data operations.
   */
  constructor(
    @Inject(IClassroomRepository)
    private classroomRepository: IClassroomRepository,
  ) {}

  /**
   * @method seedClassrooms
   * @description
   * Reads classroom data from a CSV file, parses it, and seeds classrooms into the database.
   * It maps CSV data to Classroom entities, converting the 'type' string to the ClassroomType enum.
   * Logs a success message upon completion.
   * @param {string} filePath - The path to the CSV file containing classroom data.
   * @returns {Promise<void>} A promise that resolves when all classroom data has been processed.
   * @throws {Error} If there are errors parsing the CSV file.
   */
  async seedClassrooms(filePath: string): Promise<void> {
    const csvFile = fs.readFileSync(filePath, 'utf8');
    const parseResult = Papa.parse<typeCsv.Classroom>(csvFile, {
      header: true,
      skipEmptyLines: true,
    });

    if (parseResult.errors.length > 0) {
      console.error('Errors parsing CSV:', parseResult.errors);
      throw new Error('Failed to parse CSV file.');
    }

    const classroomRows = parseResult.data;

    const classroomToCreate = classroomRows.map((row) => {
      const classroom = new Classroom();
      classroom.name = row.name;
      classroom.location = row.location;
      classroom.type =
        row.type === 'normal' ? ClassroomType.NORMAL : ClassroomType.LABORATORY;
      return classroom;
    });

    await this.classroomRepository.save(classroomToCreate);
    console.log('Successfully create classrooms');
  }
}
