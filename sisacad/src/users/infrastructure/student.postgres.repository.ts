import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Student } from '../aggregates/student.entity';
import { User } from '../aggregates/user.entity';
import { IStudentRepository } from './istudent.repository';

@Injectable()
export class StudentPostgresRepository implements IStudentRepository {
  constructor(
    @InjectRepository(Student)
    private readonly typeormRepo: Repository<Student>,
  ) {}

  async findById(id: string): Promise<Student | null> {
    return this.typeormRepo.findOne({ where: { id }, relations: ['user'] });
  }

  async findByUserId(userId: string): Promise<Student | null> {
    return this.typeormRepo.findOne({
      where: { user: { id: userId } },
      relations: ['user'],
    });
  }

  async save(student: Student): Promise<Student> {
    return this.typeormRepo.save(student);
  }

  async create(user: User, profileData: Partial<Student>): Promise<Student> {
    const studentProfile = this.typeormRepo.create({
      ...profileData,
      user: user,
    });
    return this.typeormRepo.save(studentProfile);
  }
}
