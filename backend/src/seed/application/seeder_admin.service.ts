import { Injectable, Inject } from '@nestjs/common';

import * as fs from 'fs';
import * as Papa from 'papaparse';

import * as typeCsv from './csv.types';

import { IUserRepository } from 'src/users/domain/repositories/iuser.repository';
import { IAdminRepository } from 'src/users/domain/repositories/iadmin.repository';

import { User } from 'src/users/domain/aggregates/user.entity';
import { Admin } from 'src/users/domain/aggregates/admin.entity';
import { Role } from 'src/users/domain/aggregates/role.enum';

@Injectable()
export class SeederAdminService {
  constructor(
    @Inject(IUserRepository)
    private readonly userRepository: IUserRepository,
    @Inject(IAdminRepository)
    private readonly adminRepository: IAdminRepository,
  ) {}

  async seedAdmins(filePath: string): Promise<void> {
    const csvFile = fs.readFileSync(filePath, 'utf8');
    const parseResult = Papa.parse<typeCsv.Secretary>(csvFile, {
      header: true,
      skipEmptyLines: true,
    });

    if (parseResult.errors.length > 0) {
      console.error('Errors parsing admins CSV:', parseResult.errors);
      throw new Error('Failed to parse admins CSV file.');
    }

    const adminRows = parseResult.data;

    for (const adminData of adminRows) {
      try {
        let user = await this.userRepository.findByEmail(adminData.email);
        if (user) {
          console.log(
            `User with email ${adminData.email} already exists. Skipping.`,
          );
          continue;
        }

        user = new User();
        user.email = adminData.email;
        user.isActive = true;
        user.role = Role.ADMIN;

        const adminProfile = new Admin();
        adminProfile.name = adminData.name;
        adminProfile.firstLastName = adminData.firstLastName;
        adminProfile.secondLastName = adminData.secondLastName;
        adminProfile.user = user;

        await this.adminRepository.save(adminProfile);
        console.log(`Admin ${adminData.email} seeded successfully.`);
      } catch (error) {
        if (error instanceof Error) {
          console.error(
            `Failed to process row for ${adminData.email}:`,
            error.message,
          );
        } else {
          console.error(
            `An unknown error occurred for ${adminData.email}:`,
            error,
          );
        }
      }
    }
  }
}
