import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../domain/aggregates/user.entity';
import { IUserRepository } from '../../domain/repositories/iuser.repository';

@Injectable()
export class UserPostgresRepository implements IUserRepository {
  constructor(
    @InjectRepository(User)
    private readonly typeormRepo: Repository<User>,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.typeormRepo.findOne({
      where: { email },
      relations: {
        studentProfile: true,
        teacherProfile: true,
        adminProfile: true,
        secretaryProfile: true,
      },
    });
  }

  async findById(id: string): Promise<User | null> {
    return this.typeormRepo.findOne({
      where: { id },
      relations: {
        studentProfile: true,
        teacherProfile: true,
        adminProfile: true,
        secretaryProfile: true,
      },
    });
  }

  async save(user: User): Promise<User> {
    return this.typeormRepo.save(user);
  }

  async add(user: User): Promise<User> {
    return this.typeormRepo.save(user);
  }
}
