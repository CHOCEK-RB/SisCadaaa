import { Injectable, Inject } from '@nestjs/common';

import * as fs from 'fs';
import * as Papa from 'papaparse';

import * as typeCsv from './csv.types';

import { IUserRepository } from 'src/users/domain/repositories/iuser.repository';
import { ISecretaryRepository } from 'src/users/domain/repositories/isecretary.repository';

import { User } from 'src/users/domain/aggregates/user.entity';
import { Secretary } from 'src/users/domain/aggregates/secretary.entity';
import { Role } from 'src/users/domain/aggregates/role.enum';

@Injectable()
export class SeederSecretaryService {
  constructor(
    @Inject(IUserRepository)
    private readonly userRepository: IUserRepository,
    @Inject(ISecretaryRepository)
    private readonly secretaryRepository: ISecretaryRepository,
  ) {}

  async seedSecretaries(filePath: string): Promise<void> {
    const csvFile = fs.readFileSync(filePath, 'utf8');
    const parseResult = Papa.parse<typeCsv.Secretary>(csvFile, {
      header: true,
      skipEmptyLines: true,
    });

    if (parseResult.errors.length > 0) {
      console.error('Errors parsing secretaries CSV:', parseResult.errors);
      throw new Error('Failed to parse secretaries CSV file.');
    }

    const secretaryRows = parseResult.data;

    for (const secretaryData of secretaryRows) {
      try {
        let user = await this.userRepository.findByEmail(secretaryData.email);
        if (user) {
          console.log(
            `User with email ${secretaryData.email} already exists. Skipping.`,
          );
          continue;
        }

        user = new User();
        user.email = secretaryData.email;
        user.isActive = true;
        user.role = Role.SECRETARY;

        const secretaryProfile = new Secretary();
        secretaryProfile.name = secretaryData.name;
        secretaryProfile.firstLastName = secretaryData.firstLastName;
        secretaryProfile.secondLastName = secretaryData.secondLastName;
        secretaryProfile.user = user;

        await this.secretaryRepository.save(secretaryProfile);
        console.log(`Secretary ${secretaryData.email} seeded successfully.`);
      } catch (error) {
        if (error instanceof Error) {
          console.error(
            `Failed to process row for ${secretaryData.email}:`,
            error.message,
          );
        } else {
          console.error(
            `An unknown error occurred for ${secretaryData.email}:`,
            error,
          );
        }
      }
    }
  }
}
