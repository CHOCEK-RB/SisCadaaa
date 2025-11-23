import {
  Controller,
  Get,
  Param,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';

import { AuthGuard } from '@nestjs/passport';
import { AcademicCourseService } from '../../application/services/academic_course.service';
import { AcademicCourseDTO } from '../../application/dto/academic_course.dto';

/**
 * @class AcademicCourseController
 * @description
 * Controller responsible for handling HTTP requests related to academic courses.
 * It provides an endpoint for retrieving details of a specific academic course by ID.
 * All endpoints are protected by JWT authentication.
 */
@Controller('academic-courses')
@UseGuards(AuthGuard('jwt'))
export class AcademicCourseController {
  /**
   * @constructor
   * @param {AcademicCourseService} academicCourseService - Service for managing academic course business logic.
   */
  constructor(private readonly academicCourseService: AcademicCourseService) {}

  /**
   * @method findOne
   * @description
   * Retrieves the details of a specific academic course by its ID.
   * @param {string} id - The UUID of the academic course to find.
   * @returns {Promise<AcademicCourseDTO>} A promise that resolves to the AcademicCourseDTO containing the course details.
   */
  @Get(':id')
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<AcademicCourseDTO> {
    return this.academicCourseService.findDetailsById(id);
  }
}
