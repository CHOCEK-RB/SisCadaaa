import { Admin } from '../aggregates/admin.entity';
import { User } from '../aggregates/user.entity';

export const IAdminRepository = Symbol('IAdminRepository');

export interface IAdminRepository {
  findById(id: string): Promise<Admin | null>;
  findByUserId(userId: string): Promise<Admin | null>;
  save(admin: Admin): Promise<Admin>;
  add(admin: Admin): Promise<Admin>;
}
