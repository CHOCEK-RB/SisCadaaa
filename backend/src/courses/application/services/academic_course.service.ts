import { Injectable, Inject, NotFoundException } from "@nestjs/common";
import { IAcademicCourseRepository } from "../../domain/repositories/icourse_academic.repository";
import { AcademicCourseDTO } from "../dto/academic_course.dto";
import { AcademicCourseMapper } from "../mappers/academic-course.mapper";

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
}
