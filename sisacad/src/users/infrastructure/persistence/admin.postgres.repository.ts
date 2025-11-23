import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Admin } from '../../domain/aggregates/admin.entity';
import { IAdminRepository } from '../../domain/repositories/iadmin.repository';

@Injectable()
export class AdminPostgresRepository implements IAdminRepository {
  constructor(
    @InjectRepository(Admin)
    private readonly typeormRepo: Repository<Admin>,
  ) {}

  async findById(id: string): Promise<Admin | null> {
    return this.typeormRepo.findOne({ where: { id }, relations: ['user'] });
  }

  async findByUserId(userId: string): Promise<Admin | null> {
    return this.typeormRepo.findOne({
      where: { user: { id: userId } },
      relations: ['user'],
    });
  }

  async save(admin: Admin): Promise<Admin> {
    return this.typeormRepo.save(admin);
  }

  async add(admin: Admin): Promise<Admin> {
    return this.typeormRepo.save(admin);
  }
}
