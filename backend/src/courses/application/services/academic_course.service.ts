import { Injectable, Inject, NotFoundException } from "@nestjs/common";
import { IAcademicCourseRepository } from "../../domain/repositories/icourse_academic.repository";
import { AcademicCourseDTO } from "../dto/academic_course.dto";
import { AcademicCourseMapper } from "../mappers/academic-course.mapper";
import { CreateAcademicCourseDTO } from "../dto/create-academic-course.dto";
import { ICourseRepository } from "../../domain/repositories/icourse.repository";
import { ITeacherRepository } from "src/users/domain/repositories/iteacher.repository";
import { IGlobalEventRepository } from "src/events/domain/repositories/iglobal_event.repository";
import { AcademicCourse } from "../../domain/aggregates/academic_course.entity";
import { Teacher } from "src/users/domain/aggregates/teacher.entity";

/**
 * @class AcademicCourseService
 * @description
 * Service responsible for managing academic course-related operations and data retrieval.
 * It provides methods for fetching details of academic courses.
 */
@Injectable()
export class AcademicCourseService {
  /**
   * @constructor
   * @param {IAcademicCourseRepository} academicCourseRepository - Repository for academic course data operations.
   * @param {AcademicCourseMapper} academicCourseMapper - Mapper for converting academic course entities to DTOs.
   */
  constructor(
    @Inject(IAcademicCourseRepository)
    private readonly academicCourseRepository: IAcademicCourseRepository,
    @Inject(ICourseRepository)
    private readonly courseRepository: ICourseRepository,
    @Inject(ITeacherRepository)
    private readonly teacherRepository: ITeacherRepository,
    @Inject(IGlobalEventRepository)
    private readonly globalEventRepository: IGlobalEventRepository,
    private readonly academicCourseMapper: AcademicCourseMapper,
  ) {}

  /**
   * @method findDetailsById
   * @description
   * Retrieves the details of a specific academic course by its ID.
   * @param {string} id - The UUID of the academic course to find.
   * @returns {Promise<AcademicCourseDTO>} A promise that resolves to the AcademicCourseDTO containing the course details.
   * @throws {NotFoundException} If the academic course with the given ID is not found.
   */
  async findDetailsById(id: string): Promise<AcademicCourseDTO> {
    const academicCourse = await this.academicCourseRepository.findById(id);

    if (!academicCourse) {
      throw new NotFoundException(`AcademicCourse with ID ${id} not found`);
    }

    return this.academicCourseMapper.toDto(academicCourse);
  }

  async findAllByPeriod(periodId: string): Promise<AcademicCourseDTO[]> {
    const courses =
      await this.academicCourseRepository.findByAcademicPeriodId(periodId);

    console.log(courses);

    return courses.map((course) => this.academicCourseMapper.toDto(course));
  }

  async createAcademicCourse(
    createAcademicCourseDTO: CreateAcademicCourseDTO,
  ): Promise<AcademicCourseDTO> {
    const { courseId, coordinatorId, academicPeriodId } =
      createAcademicCourseDTO;

    const course = await this.courseRepository.findById(courseId);
    if (!course) {
      throw new NotFoundException(`Course with ID ${courseId} not found`);
    }

    let coordinator: Teacher | null = null;
    if (coordinatorId) {
      coordinator = await this.teacherRepository.findById(coordinatorId);
      if (!coordinator) {
        throw new NotFoundException(
          `Coordinator with ID ${coordinatorId} not found`,
        );
      }
    }
    const academicPeriod = await this.globalEventRepository.findOne({
      where: { id: academicPeriodId },
    });
    if (!academicPeriod) {
      throw new NotFoundException(
        `Academic Period with ID ${academicPeriodId} not found`,
      );
    }

    const newAcademicCourse = new AcademicCourse(); // Declare newAcademicCourse
    newAcademicCourse.course = course;
    newAcademicCourse.coordinator = coordinator;
    newAcademicCourse.academicPeriod = academicPeriod;
    newAcademicCourse.creationDate = new Date();

    const createdAcademicCourse =
      await this.academicCourseRepository.save(newAcademicCourse);

    return this.academicCourseMapper.toDto(createdAcademicCourse);
  }
}
