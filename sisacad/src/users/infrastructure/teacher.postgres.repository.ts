import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Teacher } from '../aggregates/teacher.entity';
import { User } from '../aggregates/user.entity';
import { ITeacherRepository } from './iteacher.repository';

@Injectable()
export class TeacherPostgresRepository implements ITeacherRepository {
  constructor(
    @InjectRepository(Teacher)
    private readonly typeormRepo: Repository<Teacher>,
  ) {}

  async findById(id: string): Promise<Teacher | null> {
    return this.typeormRepo.findOne({ where: { id }, relations: ['user'] });
  }

  async findByUserId(userId: string): Promise<Teacher | null> {
    return this.typeormRepo.findOne({
      where: { user: { id: userId } },
      relations: ['user'],
    });
  }

  async save(teacher: Teacher): Promise<Teacher> {
    return this.typeormRepo.save(teacher);
  }

  async create(user: User, profileData: Partial<Teacher>): Promise<Teacher> {
    const teacherProfile = this.typeormRepo.create({
      ...profileData,
      user: user,
    });
    return this.typeormRepo.save(teacherProfile);
  }
}
