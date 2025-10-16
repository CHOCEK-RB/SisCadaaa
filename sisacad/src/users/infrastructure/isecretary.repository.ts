import { Secretary } from '../aggregates/secretary.entity';
import { User } from '../aggregates/user.entity';

export const ISecretaryRepository = Symbol('ISecretaryRepository');

export interface ISecretaryRepository {
  findById(id: string): Promise<Secretary | null>;
  findByUserId(userId: string): Promise<Secretary | null>;
  save(secretary: Secretary): Promise<Secretary>;
  create(user: User, profileData: Partial<Secretary>): Promise<Secretary>;
}
