import { Injectable, Inject } from '@nestjs/common';
import * as fs from 'fs';
import * as Papa from 'papaparse';

import * as typeCsv from './csv.types';
import { ISeederService } from './iseeder.service';

import { User } from 'src/users/aggregates/user.entity';
import { Student } from 'src/users/aggregates/student.entity';
import { Teacher } from 'src/users/aggregates/teacher.entity';
import { Secretary } from 'src/users/aggregates/secretary.entity';
import { Admin } from 'src/users/aggregates/admin.entity';
import { Course } from 'src/courses/aggregates/course.entity';
import {
  Classroom,
  ClassroomType,
} from 'src/classroom/aggregates/classrom.entity';

import { IUserRepository } from 'src/users/infrastructure/iuser.repository';
import { IStudentRepository } from 'src/users/infrastructure/istudent.repository';
import { ITeacherRepository } from 'src/users/infrastructure/iteacher.repository';
import { ISecretaryRepository } from 'src/users/infrastructure/isecretary.repository';
import { IAdminRepository } from 'src/users/infrastructure/iadmin.repository';
import { ICourseRepository } from 'src/courses/infrastructure/icourse.repository';
import { IClassroomRepository } from 'src/classroom/application/iclassroom.repository';

@Injectable()
export class SeederService implements ISeederService {
  constructor(
    @Inject(IUserRepository)
    private readonly userRepository: IUserRepository,
    @Inject(IStudentRepository)
    private readonly studentRepository: IStudentRepository,
    @Inject(ITeacherRepository)
    private readonly teacherRepository: ITeacherRepository,
    @Inject(ISecretaryRepository)
    private readonly secretaryRepository: ISecretaryRepository,
    @Inject(IAdminRepository)
    private readonly adminRepository: IAdminRepository,
    @Inject(ICourseRepository)
    private readonly courseRepository: ICourseRepository,
    @Inject(IClassroomRepository)
    private readonly classroomRepository: IClassroomRepository,
  ) {}

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
  }

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
    console.log(parseResult.data);

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
        console.log(
          `Successfully created teacher: ${teacherData.name} ${teacherData.firstLastName} ${teacherData.secondLastName}`,
        );
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

  async seedSecretary(filePath: string): Promise<void> {
    const csvFile = fs.readFileSync(filePath, 'utf8');
    const parseResult = Papa.parse<typeCsv.Secretary>(csvFile, {
      header: true,
      skipEmptyLines: true,
    });

    if (parseResult.errors.length > 0) {
      console.error('Errors parsing CSV:', parseResult.errors);
      throw new Error('Failed to parse CSV file.');
    }

    const secretaryRows = parseResult.data;
    console.log(parseResult.data);

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

        const secretaryProfile = new Secretary();
        secretaryProfile.name = secretaryData.name;
        secretaryProfile.firstLastName = secretaryData.firstLastName;
        secretaryProfile.secondLastName = secretaryData.secondLastName;
        secretaryProfile.user = user;

        await this.secretaryRepository.save(secretaryProfile);
        console.log(
          `Successfully created secretary: ${secretaryData.name} ${secretaryData.firstLastName} ${secretaryData.secondLastName}`,
        );
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

  async seedAdmin(filePath: string): Promise<void> {
    const csvFile = fs.readFileSync(filePath, 'utf8');
    const parseResult = Papa.parse<typeCsv.Admin>(csvFile, {
      header: true,
      skipEmptyLines: true,
    });

    if (parseResult.errors.length > 0) {
      console.error('Errors parsing CSV:', parseResult.errors);
      throw new Error('Failed to parse CSV file.');
    }

    const adminRows = parseResult.data;
    console.log(parseResult.data);

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

        const adminProfile = new Admin();
        adminProfile.name = adminData.name;
        adminProfile.firstLastName = adminData.firstLastName;
        adminProfile.secondLastName = adminData.secondLastName;
        adminProfile.user = user;

        await this.adminRepository.save(adminProfile);
        console.log(
          `Successfully created admin: ${adminData.name} ${adminData.firstLastName} ${adminData.secondLastName}`,
        );
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

  async seedCourses(filePath: string): Promise<void> {
    const csvFile = fs.readFileSync(filePath, 'utf8');
    const parseResult = Papa.parse<typeCsv.Course>(csvFile, {
      header: true,
      skipEmptyLines: true,
    });

    if (parseResult.errors.length > 0) {
      console.error('Errors parsing CSV:', parseResult.errors);
      throw new Error('Failed to parse CSV file.');
    }

    const courseRows = parseResult.data;
    console.log(parseResult.data);

    const coursesToCreate = courseRows.map((row) => {
      const course = new Course();
      course.code = row.code;
      course.name = row.name;
      course.credits = parseInt(row.credits, 10);
      course.semester = parseInt(row.semester, 10);
      course.preRrqs = [];
      return course;
    });

    const savedCourses = await this.courseRepository.save(coursesToCreate);
    console.log(`Created ${savedCourses.length} courses.`);

    const coursesMap = new Map<string, Course>();
    savedCourses.forEach((course) => coursesMap.set(course.code, course));

    const coursesToUpdate: Course[] = [];

    for (const row of courseRows) {
      const mainCourse = coursesMap.get(row.code);
      if (!mainCourse) continue;

      const prerequisites: Course[] = [];

      if (row.prrq_1) {
        const prereq1 = coursesMap.get(row.prrq_1);
        if (prereq1) {
          prerequisites.push(prereq1);
        }
      }

      if (row.prrq_2) {
        const prereq2 = coursesMap.get(row.prrq_2);
        if (prereq2) {
          prerequisites.push(prereq2);
        }
      }

      if (prerequisites.length > 0) {
        mainCourse.preRrqs = prerequisites;
        coursesToUpdate.push(mainCourse);
      }
    }

    if (coursesToUpdate.length > 0) {
      await this.courseRepository.save(coursesToUpdate);
      console.log(
        `Linked prerequisites for ${coursesToUpdate.length} courses.`,
      );
    }

    console.log('Course seeding completed successfully!');
  }

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
    console.log(parseResult.data);

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

  async runAll(): Promise<void> {
    await this.seedStudents('students.csv');
    await this.seedTeachers('teachers.csv');
    await this.seedSecretary('secretaries.csv');
    await this.seedAdmin('admins.csv');
    await this.seedCourses('courses.csv');
    await this.seedClassrooms('classrooms.csv');
    console.log('All data has been seeded!');
  }
}
