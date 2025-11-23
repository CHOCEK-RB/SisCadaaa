import { User } from '../aggregates/user.entity';

export const IUserRepository = Symbol('IUserRepository');

export interface IUserRepository {
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  save(user: User): Promise<User>;
  add(user: User): Promise<User>;
}
