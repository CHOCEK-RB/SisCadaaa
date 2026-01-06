import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "../../domain/aggregates/user.entity";
import {
  FindAllUsersOptions,
  IUserRepository,
  PaginatedUsersResult,
} from "../../domain/repositories/iuser.repository";

@Injectable()
export class UserPostgresRepository implements IUserRepository {
  constructor(
    @InjectRepository(User)
    private readonly typeormRepo: Repository<User>,
  ) {}

  async findAll(options: FindAllUsersOptions): Promise<PaginatedUsersResult> {
    const {
      role,
      searchQuery,
      page = 1,
      limit = 10,
      sortBy = "user.createdAt",
      order = "DESC",
    } = options;

    const queryBuilder = this.typeormRepo.createQueryBuilder("user");

    // Always join with all possible profiles
    queryBuilder
      .leftJoinAndSelect("user.studentProfile", "student")
      .leftJoinAndSelect("user.teacherProfile", "teacher")
      .leftJoinAndSelect("user.secretaryProfile", "secretary")
      .leftJoinAndSelect("user.adminProfile", "admin");

    // Filter by role if provided
    if (role) {
      switch (role.toLowerCase()) {
        case "student":
          queryBuilder.where("student.id IS NOT NULL");
          break;
        case "teacher":
          queryBuilder.where("teacher.id IS NOT NULL");
          break;
        case "secretary":
          queryBuilder.where("secretary.id IS NOT NULL");
          break;
        case "admin":
          queryBuilder.where("admin.id IS NOT NULL");
          break;
      }
    }

    // Filter by search query if provided
    if (searchQuery) {
      const ILIKE = "ILIKE";
      queryBuilder.andWhere(
        `(
          user.email ${ILIKE} :searchQuery OR
          student.cui ${ILIKE} :searchQuery OR
          student.name ${ILIKE} :searchQuery OR
          student.firstLastName ${ILIKE} :searchQuery OR
          student.secondLastName ${ILIKE} :searchQuery OR
          teacher.name ${ILIKE} :searchQuery OR
          teacher.firstLastName ${ILIKE} :searchQuery OR
          teacher.secondLastName ${ILIKE} :searchQuery
        )`,
        { searchQuery: `%${searchQuery}%` },
      );
    }

    // Apply sorting
    queryBuilder.orderBy(sortBy, order);

    // Apply pagination
    queryBuilder.skip((page - 1) * limit).take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return { data, total };
  }

  async findAllStudents(
    options: FindAllUsersOptions,
  ): Promise<PaginatedUsersResult> {
    const {
      searchQuery,
      page = 1,
      limit = 10,
      sortBy = "name",
      order = "DESC",
    } = options;

    const columnMap: { [key: string]: string } = {
      email: "user.email",
      name: "student.name",
      cui: "student.cui",
    };

    const mappedSortBy = Object.prototype.hasOwnProperty.call(columnMap, sortBy)
      ? columnMap[sortBy]
      : "student.name";

    const queryBuilder = this.typeormRepo.createQueryBuilder("user");

    queryBuilder
      .leftJoinAndSelect("user.studentProfile", "student")
      .where("student.id IS NOT NULL");

    if (searchQuery) {
      const ILIKE = "ILIKE";
      queryBuilder.andWhere(
        `(
          user.email ${ILIKE} :searchQuery OR
          student.cui ${ILIKE} :searchQuery OR
          student.name ${ILIKE} :searchQuery OR
          student.firstLastName ${ILIKE} :searchQuery OR
          student.secondLastName ${ILIKE} :searchQuery
        )`,
        { searchQuery: `%${searchQuery}%` },
      );
    }

    queryBuilder.orderBy(mappedSortBy, order);

    queryBuilder.skip((page - 1) * limit).take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return { data, total };
  }

  async findAllTeachers(
    options: FindAllUsersOptions,
  ): Promise<PaginatedUsersResult> {
    const {
      searchQuery,
      page = 1,
      limit = 10,
      sortBy = "name",
      order = "DESC",
    } = options;

    const columnMap: { [key: string]: string } = {
      email: "user.email",
      name: "teacher.name",
    };

    const mappedSortBy = Object.prototype.hasOwnProperty.call(columnMap, sortBy)
      ? columnMap[sortBy]
      : "teacher.name";

    const queryBuilder = this.typeormRepo.createQueryBuilder("user");

    queryBuilder
      .leftJoinAndSelect("user.teacherProfile", "teacher")
      .where("teacher.id IS NOT NULL");

    if (searchQuery) {
      const ILIKE = "ILIKE";
      queryBuilder.andWhere(
        `(
          user.email ${ILIKE} :searchQuery OR
          teacher.name ${ILIKE} :searchQuery OR
          teacher.firstLastName ${ILIKE} :searchQuery OR
          teacher.secondLastName ${ILIKE} :searchQuery
        )`,
        { searchQuery: `%${searchQuery}%` },
      );
    }

    queryBuilder.orderBy(mappedSortBy, order);

    queryBuilder.skip((page - 1) * limit).take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return { data, total };
  }

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
