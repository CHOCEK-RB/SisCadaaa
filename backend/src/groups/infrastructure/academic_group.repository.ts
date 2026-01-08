import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { In } from "typeorm";

import {
  AcademicGroup,
  GroupType,
} from "../domain/aggregates/academic_group.entity";

import { IAcademicGroupRepository } from "../domain/repositories/iacademic_group.repository";

@Injectable()
export class AcademicGroupRepository implements IAcademicGroupRepository {
  constructor(
    @InjectRepository(AcademicGroup)
    private readonly typeormRepo: Repository<AcademicGroup>,
  ) {}

  async findById(id: string): Promise<AcademicGroup | null> {
    return this.typeormRepo.findOne({
      where: { id },
      relations: {
        enrollments: { student: true },
        teacher: true,
        academicCourse: { course: true },
      },
    });
  }

  async findGroupDetailsById(id: string): Promise<AcademicGroup | null> {
    return this.typeormRepo.findOne({
      where: { id },
      relations: {
        teacher: { user: true },
        academicCourse: {
          course: true,
          coordinator: { user: true },
          topics: true,
          progress: { completedTopics: true },
        },
        enrollments: true,
      },
    });
  }

  async findGroupGradesById(id: string): Promise<AcademicGroup | null> {
    return this.typeormRepo.findOne({
      where: { id },
      relations: {
        enrollments: { student: true },
        academicCourse: { course: true },
      },
    });
  }

  async findByIdWithEnrolledStudents(
    groupId: string,
  ): Promise<AcademicGroup | null> {
    return this.typeormRepo.findOne({
      where: { id: groupId },
      relations: {
        enrollments: { student: { user: true } },
      },
    });
  }

  async findByIdAndType(
    id: string,
    type: GroupType,
  ): Promise<AcademicGroup | null> {
    return this.typeormRepo.findOne({
      where: { id, type },
      relations: {
        academicCourse: { course: true },
        enrollments: true,
        teacher: true,
      },
    });
  }

  async findAll(): Promise<AcademicGroup[]> {
    return this.typeormRepo.find();
  }

  async findAllByCoursesAndType(
    academicCourseIds: string[],
    type: GroupType,
  ): Promise<AcademicGroup[] | null> {
    return await this.typeormRepo.find({
      where: {
        academicCourse: { id: In(academicCourseIds) },
        type: type,
      },
      relations: {
        academicCourse: { course: true },
        schedule: { classroom: true },
        enrollments: true,
      },
    });
  }

  async add(group: AcademicGroup): Promise<AcademicGroup> {
    return this.typeormRepo.save(group);
  }

  async findByGroupIds(
    groupIds: string[],
    type: GroupType,
  ): Promise<AcademicGroup[] | null> {
    return await this.typeormRepo.find({
      where: {
        id: In(groupIds),
        type: type,
      },
      relations: {
        academicCourse: { course: true },
        schedule: { classroom: true },
        enrollments: true,
      },
    });
  }

  async findByAcaCourseAndType(
    id: string,
    type: GroupType,
  ): Promise<AcademicGroup[] | null> {
    return this.typeormRepo.find({
      where: { type: type, academicCourse: { id: id } },
      relations: {
        schedule: { classroom: true },
        enrollments: true,
      },
    });
  }

  async findByIdTeacher(teacherId: string): Promise<AcademicGroup[] | null> {
    return this.typeormRepo.find({
      where: { teacher: { id: teacherId } },
      relations: { academicCourse: { course: true } },
    });
  }

  async getCourseInfo(id: string): Promise<AcademicGroup | null> {
    return this.typeormRepo.findOne({
      where: { id },
      relations: { academicCourse: { course: true, topics: true } },
    });
  }

  async getEnrollments(id: string): Promise<AcademicGroup | null> {
    return this.typeormRepo.findOne({
      where: { id },
      relations: { enrollments: { student: true } },
    });
  }

  async getAttendances(id: string): Promise<AcademicGroup | null> {
    return this.typeormRepo.findOne({
      where: { id },
      relations: { attendances: true },
    });
  }

  async update(
    id: string,
    updatedFields: Partial<AcademicGroup>,
  ): Promise<AcademicGroup | null> {
    await this.typeormRepo.update(id, updatedFields);
    return this.findById(id); // Fetch and return the updated entity
  }

  async findByIdAcademicCourse(
    courseAcademicId: string,
  ): Promise<AcademicGroup[] | null> {
    return this.typeormRepo.find({
      where: { academicCourse: { id: courseAcademicId } },
      relations: { academicCourse: { course: true }, schedule: true },
    });
  }

  async findByCourseCodeTypeName(
    courseCode: string,
    type: GroupType,
    name: string,
  ): Promise<AcademicGroup[] | null> {
    return this.typeormRepo.find({
      where: {
        type: type,
        name: name,
        academicCourse: { course: { code: courseCode } },
      },
      relations: {
        academicCourse: {
          course: true,
        },
      },
    });
  }

  async findByCourseCodeTypeNameAge(
    courseCode: string,
    age: string,
    type: GroupType,
    name: string,
  ): Promise<AcademicGroup | null> {
    if (!courseCode || !type || !name || !age) {
      return null;
    }

    const pattern = `%${age}%`;
    const query = this.typeormRepo
      .createQueryBuilder("group")
      .innerJoin("group.academicCourse", "ac")
      .innerJoin("ac.course", "course")
      .where("group.type = :type", { type })
      .andWhere("group.name = :name", { name })
      .andWhere("course.code = :courseCode", { courseCode })
      .andWhere("CAST(ac.creationDate AS TEXT) LIKE :agePattern", {
        agePattern: pattern,
      })
      .take(1);

    const result = await query.getOne();

    return result || null;
  }

  async findGroupsByCourseIdWithTeacherAndTopics(
    courseId: string,
  ): Promise<AcademicGroup[] | null> {
    return this.typeormRepo.find({
      where: { academicCourse: { id: courseId } },
      relations: {
        teacher: {
          user: true,
        },
        academicCourse: {
          topics: true,
        },
      },
    });
  }

  async getScheduleById(id: string): Promise<AcademicGroup | null> {
    return this.typeormRepo.findOne({
      where: { id },
      relations: {
        schedule: { classroom: true },
        teacher: true,
        academicCourse: true,
      },
    });
  }

  async getAcademicCourse(id: string): Promise<AcademicGroup | null> {
    return this.typeormRepo.findOne({
      where: { id },
      relations: {
        academicCourse: {
          course: true,
          coordinator: true,
          topics: true,
        },
      },

      order: {
        academicCourse: {
          topics: {
            topicOrder: "ASC",
          },
        },
      },
    });
  }

  async findWithScheduleByTeacherId(
    teacherId: string,
  ): Promise<AcademicGroup[] | null> {
    return this.typeormRepo.find({
      where: { teacher: { id: teacherId } },
      relations: {
        academicCourse: { course: true },
        schedule: { classroom: true },
        teacher: true,
      },
    });
  }

  save(group: AcademicGroup): Promise<AcademicGroup>; // Added this line
  save(groups: AcademicGroup[]): Promise<AcademicGroup[]>;
  async save(
    groupOrGroups: AcademicGroup | AcademicGroup[],
  ): Promise<AcademicGroup | AcademicGroup[]> {
    if (Array.isArray(groupOrGroups)) {
      return this.typeormRepo.save(groupOrGroups);
    } else {
      return this.typeormRepo.save(groupOrGroups);
    }
  }

  async findByClassroomId(classroomId: string): Promise<AcademicGroup[]> {
    return this.typeormRepo.find({
      where: {
        schedule: {
          classroom: {
            id: classroomId,
          },
        },
      },
      relations: {
        academicCourse: { course: true },
        schedule: { classroom: true },
        teacher: true,
      },
    });
  }
  async findAllByIdTeacher(teacherId: string): Promise<AcademicGroup[]> {
    return await this.typeormRepo
      .createQueryBuilder("group")
      .innerJoinAndSelect(
        "group.teacher",
        "teacher",
        "teacher.id = :teacherId",
        { teacherId },
      )
      .leftJoinAndSelect("group.academicCourse", "academicCourse")
      .leftJoinAndSelect("academicCourse.course", "course")
      .leftJoinAndSelect("group.enrollments", "enrollments")
      .orderBy({
        "academicCourse.creationDate": "DESC",
      })
      .getMany();
  }
  async findScheduleByTeacherIdForSecretary(
    teacherId: string,
  ): Promise<AcademicGroup[]> {
    return await this.typeormRepo
      .createQueryBuilder("group")
      .innerJoinAndSelect(
        "group.teacher",
        "teacher",
        "teacher.id = :teacherId",
        { teacherId },
      )
      .leftJoinAndSelect("group.academicCourse", "academicCourse")
      .leftJoinAndSelect("academicCourse.course", "course")
      .leftJoinAndSelect("group.schedule", "schedule")
      .leftJoinAndSelect("schedule.classroom", "classroom")
      .getMany();
  }
}
