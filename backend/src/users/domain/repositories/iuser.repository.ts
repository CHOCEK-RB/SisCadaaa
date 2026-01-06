import { User } from "../aggregates/user.entity";

export const IUserRepository = Symbol("IUserRepository");

export interface FindAllUsersOptions {
  readonly role?: string;
  readonly searchQuery?: string;
  readonly page?: number;
  readonly limit?: number;
  readonly sortBy?: string;
  readonly order?: "ASC" | "DESC";
}

export interface FindAllStudentsOptions {
  readonly searchQuery?: string;
  readonly page?: number;
  readonly limit?: number;
  readonly sortBy?: string;
  readonly order?: "ASC" | "DESC";
}

export interface FindAllTeachersOptions {
  readonly searchQuery?: string;
  readonly page?: number;
  readonly limit?: number;
  readonly sortBy?: string;
  readonly order?: "ASC" | "DESC";
}

export interface PaginatedUsersResult {
  data: User[];
  total: number;
}

export interface IUserRepository {
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  save(user: User): Promise<User>;
  add(user: User): Promise<User>;
  findAll(options: FindAllUsersOptions): Promise<PaginatedUsersResult>;
  findAllStudents(
    options: FindAllStudentsOptions,
  ): Promise<PaginatedUsersResult>;
  findAllTeachers(
    options: FindAllTeachersOptions,
  ): Promise<PaginatedUsersResult>;
  delete(id: string): Promise<void>;
}
