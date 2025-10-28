import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../aggregates/user.entity';
import { IUserRepository } from './iuser.repository';

@Injectable()
export class UserPostgresRepository implements IUserRepository {
  constructor(
    @InjectRepository(User)
    private readonly typeormRepo: Repository<User>,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.typeormRepo.findOne({ where: { email } });
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

  async create(email: string): Promise<User> {
    const newUser = this.typeormRepo.create({ email });
    return this.typeormRepo.save(newUser);
  }
}
