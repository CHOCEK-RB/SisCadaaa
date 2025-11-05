import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { In } from 'typeorm';

import { AcademicGroup, GroupType } from '../aggregates/academic_group.entity';
import { AcademicCourse } from 'src/courses/aggregates/academic_course.entity';

import { IAcademicGroupRepository } from './iacademic_group.repository';

@Injectable()
export class AcademicGroupRepository implements IAcademicGroupRepository {
  constructor(
    @InjectRepository(AcademicGroup)
    private readonly typeormRepo: Repository<AcademicGroup>,
  ) {}

  async findById(id: string): Promise<AcademicGroup | null> {
    return this.typeormRepo.findOne({ where: { id } });
  }

  async findByIdAndType(
    id: string,
    type: GroupType,
  ): Promise<AcademicGroup | null> {
    return this.typeormRepo.findOne({
      where: { id, type },
      relations: { academicCourse: { course: true }, enrollments: true },
    });
  }

  async findAll(): Promise<AcademicGroup[]> {
    return this.typeormRepo.find();
  }

  async findAllByCoursesAndType(
    academicCourseIds: string[],
    type: GroupType,
  ): Promise<AcademicGroup[] | null> {
    return await this.typeormRepo.find({
      where: {
        academicCourse: { id: In(academicCourseIds) },
        type: type,
      },
      relations: {
        academicCourse: { course: true },
        schedule: { classroom: true },
        enrollments: true,
      },
    });
  }

  async findAllById(
    academicCourseIds: string[],
    type: GroupType,
  ): Promise<AcademicGroup[] | null> {
    return await this.typeormRepo.find({
      where: {
        id: In(academicCourseIds),
        type: type,
      },
      relations: {
        academicCourse: { course: true },
        schedule: { classroom: true },
        enrollments: true,
      },
    });
  }

  async findByAcaCourseAndType(
    id: string,
    type: GroupType,
  ): Promise<AcademicGroup[] | null> {
    return this.typeormRepo.find({
      where: { type: type, academicCourse: { id: id } },
      relations: {
        schedule: { classroom: true },
        enrollments: true,
      },
    });
  }

  async findByIdTeacher(teacherId: string): Promise<AcademicGroup[] | null> {
    return this.typeormRepo.find({
      where: { teacher: { id: teacherId } },
      relations: { academicCourse: { course: true } },
    });
  }

  async getCourseInfo(id: string): Promise<AcademicGroup | null> {
    return this.typeormRepo.findOne({
      where: { id },
      relations: { academicCourse: { course: true, topics: true } },
    });
  }

  async getEnrollments(id: string): Promise<AcademicGroup | null> {
    return this.typeormRepo.findOne({
      where: { id },
      relations: { enrollments: { student: true } },
    });
  }

  async getAttendances(id: string): Promise<AcademicGroup | null> {
    return this.typeormRepo.findOne({
      where: { id },
      relations: { attendances: true },
    });
  }

  async findByIdAcademicCourse(
    courseAcademicId: string,
  ): Promise<AcademicGroup[] | null> {
    return this.typeormRepo.find({
      where: { academicCourse: { id: courseAcademicId } },
      relations: { academicCourse: { course: true }, schedule: true },
    });
  }

  async findByCourseCodeTypeName(
    courseCode: string,
    type: GroupType,
    name: string,
  ): Promise<AcademicGroup[] | null> {
    console.log(courseCode, type, name);
    return this.typeormRepo.find({
      where: {
        type: type,
        name: name,
        academicCourse: { course: { code: courseCode } },
      },
      relations: {
        academicCourse: {
          course: true,
        },
      },
    });
  }

  async findByCourseCodeTypeNameAge(
    courseCode: string,
    age: string,
    type: GroupType,
    name: string,
  ): Promise<AcademicGroup | null> {
    if (!courseCode || !type || !name || !age) {
      return null;
    }

    const pattern = `%${age}%`;
    const query = this.typeormRepo
      .createQueryBuilder('group')
      .innerJoin('group.academicCourse', 'ac')
      .innerJoin('ac.course', 'course')
      .where('group.type = :type', { type })
      .andWhere('group.name = :name', { name })
      .andWhere('course.code = :courseCode', { courseCode })
      .andWhere('CAST(ac.creationDate AS TEXT) LIKE :agePattern', {
        agePattern: pattern,
      })
      .take(1);

    const result = await query.getOne();

    return result || null;
  }

  save(group: AcademicGroup): Promise<AcademicGroup>;
  save(groups: AcademicGroup[]): Promise<AcademicGroup[]>;
  async save(
    groupOrGroups: AcademicGroup | AcademicGroup[],
  ): Promise<AcademicGroup | AcademicGroup[]> {
    if (Array.isArray(groupOrGroups)) {
      return this.typeormRepo.save(groupOrGroups);
    } else {
      return this.typeormRepo.save(groupOrGroups);
    }
  }

  async create(
    name: string,
    capacity: number,
    type: GroupType,
    course: AcademicCourse,
  ): Promise<AcademicGroup> {
    const newGroup = this.typeormRepo.create({
      name: name,
      capacity: capacity,
      type: type,
      academicCourse: course,
    });

    return this.typeormRepo.save(newGroup);
  }
}
