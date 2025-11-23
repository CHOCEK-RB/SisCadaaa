import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Secretary } from '../../domain/aggregates/secretary.entity';
import { ISecretaryRepository } from '../../domain/repositories/isecretary.repository';

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

  async add(secretary: Secretary): Promise<Secretary> {
    return this.typeormRepo.save(secretary);
  }
}
