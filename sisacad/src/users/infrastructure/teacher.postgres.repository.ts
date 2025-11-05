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
  async getIdForUserId(userId: string): Promise<string | null> {
    const teacher = await this.typeormRepo.findOne({
      select: { id: true },
      where: { user: { id: userId } },
      relations: { user: true },
    });
    return teacher?.id ?? null;
  }

  async findById(id: string): Promise<Teacher | null> {
    return this.typeormRepo.findOne({ where: { id }, relations: ['user'] });
  }

  async findAll(): Promise<Teacher[] | null> {
    return this.typeormRepo.find();
  }

  async findByUserId(userId: string): Promise<Teacher | null> {
    return this.typeormRepo.findOne({
      where: { user: { id: userId } },
      relations: ['user'],
    });
  }

  async findRandom(): Promise<Teacher | null> {
    const count = await this.typeormRepo.count();

    if (count === 0) {
      return null;
    }

    const randomOffset = Math.floor(Math.random() * count);
    const randomTeacher = await this.typeormRepo
      .createQueryBuilder('teacher')
      .offset(randomOffset)
      .limit(1)
      .getOne();

    return randomTeacher;
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
