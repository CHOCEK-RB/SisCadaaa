import { Injectable, Inject } from '@nestjs/common';
import { IUserRepository } from 'src/users/infrastructure/iuser.repository';
import * as fs from 'fs';
import * as Papa from 'papaparse';
import { Student } from 'src/users/aggregates/student.entity';
import { User } from 'src/users/aggregates/user.entity';
import { IStudentRepository } from 'src/users/infrastructure/istudent.repository';

type StudentCsvRow = {
  cui: string;
  name: string;
  firstLastName: string;
  secondLastName: string;
  email: string;
  semester: string;
};

@Injectable()
export class SeedingService {
  constructor(
    @Inject(IUserRepository)
    private readonly userRepository: IUserRepository,
    @Inject(IStudentRepository)
    private readonly studentRepository: IStudentRepository,
  ) {}

  async seedStudentsFromCsv(filePath: string): Promise<void> {
    console.log(`Starting to seed students from ${filePath}...`);
    const csvFile = fs.readFileSync(filePath, 'utf8');

    const parseResult = Papa.parse<StudentCsvRow>(csvFile, {
      header: true,
      skipEmptyLines: true,
    });

    if (parseResult.errors.length > 0) {
      console.error('Errors parsing CSV:', parseResult.errors);
      throw new Error('Failed to parse CSV file.');
    }

    const studentRows = parseResult.data;

    console.log(parseResult.data);

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

        const studentProfile = new Student();
        studentProfile.cui = studentData.cui;
        studentProfile.name = studentData.name;
        studentProfile.firstLastName = studentData.firstLastName;
        studentProfile.secondLastName = studentData.secondLastName;
        studentProfile.semester = parseInt(studentData.semester, 10);

        studentProfile.user = user;

        await this.studentRepository.save(studentProfile);
        console.log(
          `Successfully created student with ID ${studentData.cui}: ${studentData.name} ${studentData.firstLastName} ${studentData.secondLastName}`,
        );
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

    console.log('Finished seeding students.');
  }
}
