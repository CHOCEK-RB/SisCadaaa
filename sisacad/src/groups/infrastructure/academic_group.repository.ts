import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

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

  async findAll(): Promise<AcademicGroup[]> {
    return this.typeormRepo.find();
  }

  async findByIdTeacher(teacherId: string): Promise<AcademicGroup[] | null> {
    return this.typeormRepo.find({ where: { teacher: { id: teacherId } } });
  }

  async findByIdAcademicCourse(
    courseAcademicId: string,
  ): Promise<AcademicGroup[] | null> {
    return this.typeormRepo.find({
      where: { academicCourse: { id: courseAcademicId } },
    });
  }

  async findByCourseCodeTypeName(
    courseCode: string,
    type: GroupType,
    name: string,
  ): Promise<AcademicGroup | null> {
    console.log(courseCode, type, name);
    return this.typeormRepo.findOne({
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
