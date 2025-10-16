import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Secretary } from '../aggregates/secretary.entity';
import { User } from '../aggregates/user.entity';
import { ISecretaryRepository } from './isecretary.repository';

@Injectable()
export class SecretaryPostgresRepository implements ISecretaryRepository {
  constructor(
    @InjectRepository(Secretary)
    private readonly typeormRepo: Repository<Secretary>,
  ) {}

  async findById(id: string): Promise<Secretary | null> {
    return this.typeormRepo.findOne({ where: { id }, relations: ['user'] });
  }

  async findByUserId(userId: string): Promise<Secretary | null> {
    return this.typeormRepo.findOne({
      where: { user: { id: userId } },
      relations: ['user'],
    });
  }

  async save(secretary: Secretary): Promise<Secretary> {
    return this.typeormRepo.save(secretary);
  }

  async create(
    user: User,
    profileData: Partial<Secretary>,
  ): Promise<Secretary> {
    const secretaryProfile = this.typeormRepo.create({
      ...profileData,
      user: user,
    });
    return this.typeormRepo.save(secretaryProfile);
  }
}
