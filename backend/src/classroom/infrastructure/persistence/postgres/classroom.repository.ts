import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import {
  Classroom,
  ClassroomType,
} from 'src/classroom/domain/aggregates/classroom.entity';
import { IClassroomRepository } from 'src/classroom/domain/repositories/iclassroom.repository';

@Injectable()
export class ClassroomRepository implements IClassroomRepository {
  constructor(
    @InjectRepository(Classroom)
    private readonly typeormRepo: Repository<Classroom>,
  ) {}

  async findById(id: string): Promise<Classroom | null> {
    return this.typeormRepo.findOne({ where: { id } });
  }

  async findByName(name: string): Promise<Classroom | null> {
    return this.typeormRepo.findOne({ where: { name } });
  }

  async findByType(type: ClassroomType): Promise<Classroom[] | null> {
    return this.typeormRepo.find({ where: { type: type } });
  }

  async findAll(): Promise<Classroom[] | null> {
    return this.typeormRepo.find();
  }

  save(classroom: Classroom): Promise<Classroom>;
  save(classrooms: Classroom[]): Promise<Classroom[]>;
  async save(
    classroomOrClassrooms: Classroom | Classroom[],
  ): Promise<Classroom | Classroom[]> {
    if (Array.isArray(classroomOrClassrooms)) {
      return this.typeormRepo.save(classroomOrClassrooms);
    } else {
      return this.typeormRepo.save(classroomOrClassrooms);
    }
  }

  async add(classroom: Classroom): Promise<Classroom> {
    return this.typeormRepo.save(classroom);
  }
}
