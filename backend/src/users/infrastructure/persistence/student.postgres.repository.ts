import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Student } from "../../domain/aggregates/student.entity";
import { IStudentRepository } from "../../domain/repositories/istudent.repository";

@Injectable()
export class StudentPostgresRepository implements IStudentRepository {
  constructor(
    @InjectRepository(Student)
    private readonly typeormRepo: Repository<Student>,
  ) {}

  async findById(id: string): Promise<Student | null> {
    return this.typeormRepo.findOne({
      where: { id },
      relations: { user: true, enrollments: { course: { course: true } } },
    });
  }

  async findAll(): Promise<Student[] | null> {
    return this.typeormRepo.find({ relations: ["user"] });
  }

  async findByUserId(userId: string): Promise<Student | null> {
    return this.typeormRepo.findOne({
      where: { user: { id: userId } },
      relations: ["user"],
    });
  }

  async save(student: Student): Promise<Student> {
    return this.typeormRepo.save(student);
  }

  async add(student: Student): Promise<Student> {
    return this.typeormRepo.save(student);
  }
}
