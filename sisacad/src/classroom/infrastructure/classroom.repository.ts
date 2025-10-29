import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Classroom } from '../aggregates/classrom.entity';
import { ClassroomType } from '../aggregates/classrom.entity';
import { IClassroomRepository } from './iclassroom.repository';

@Injectable()
export class ClassroomRepository implements IClassroomRepository {
  constructor(
    @InjectRepository(Classroom)
    private readonly typeormRepo: Repository<Classroom>,
  ) {}

  async findById(id: string): Promise<Classroom | null> {
    return this.typeormRepo.findOne({ where: { id } });
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

  create(
    name: string,
    location: string,
    type: ClassroomType,
  ): Promise<Classroom | null> {
    const newClassroom = this.typeormRepo.create({
      name: name,
      location: location,
      type: type,
    });

    return this.typeormRepo.save(newClassroom);
  }
}
