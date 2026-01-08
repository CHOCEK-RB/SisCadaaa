import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Teacher } from "../../domain/aggregates/teacher.entity";
import { ITeacherRepository } from "../../domain/repositories/iteacher.repository";

@Injectable()
export class TeacherPostgresRepository implements ITeacherRepository {
  constructor(
    @InjectRepository(Teacher)
    private readonly typeormRepo: Repository<Teacher>,
  ) {}
  async getIdForUserId(userId: string): Promise<string | null> {
    const teacher = await this.typeormRepo.findOne({
      select: { id: true },
      where: { user: { id: userId } },
      relations: { user: true },
    });
    return teacher?.id ?? null;
  }

  async findById(id: string): Promise<Teacher | null> {
    return this.typeormRepo.findOne({ where: { id }, relations: ["user"] });
  }

  async findAll(): Promise<Teacher[] | null> {
    return this.typeormRepo.find({ relations: ["user"] });
  }

  async findByUserId(userId: string): Promise<Teacher | null> {
    return this.typeormRepo.findOne({
      where: { user: { id: userId } },
      relations: ["user"],
    });
  }

  async findRandom(): Promise<Teacher | null> {
    const count = await this.typeormRepo.count();

    if (count === 0) {
      return null;
    }

    const randomOffset = Math.floor(Math.random() * count);
    const randomTeacher = await this.typeormRepo
      .createQueryBuilder("teacher")
      .offset(randomOffset)
      .limit(1)
      .getOne();

    return randomTeacher;
  }

  async save(teacher: Teacher): Promise<Teacher> {
    return this.typeormRepo.save(teacher);
  }

  async add(teacher: Teacher): Promise<Teacher> {
    return this.typeormRepo.save(teacher);
  }

  async delete(id: string): Promise<void> {
    await this.typeormRepo.delete(id);
  }
}
