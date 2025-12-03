import {
  Controller,
  Get,
  Param,
  UseGuards,
  ParseUUIDPipe,
  Post,
  Body,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AcademicCourseService } from '../../application/services/academic_course.service';
import { AcademicCourseDTO } from '../../application/dto/academic_course.dto';
import { TopicProgressService } from 'src/courses/application/services/topic-progress.service';
import { UpdateTopicProgressDTO } from 'src/courses/application/dto/update-topic-progress.dto';
import { Roles } from 'src/auth/presentation/decorators/roles.decorator';
import { RolesGuard } from 'src/auth/presentation/guards/roles.guard';
import { Role } from 'src/users/domain/aggregates/role.enum';

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
  constructor(
    private readonly academicCourseService: AcademicCourseService,
    private readonly topicProgressService: TopicProgressService,
  ) {}

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

  @Post(':id/progress')
  @UseGuards(RolesGuard)
  @Roles(Role.TEACHER)
  async updateTopicProgress(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTopicProgressDTO: UpdateTopicProgressDTO,
  ) {
    return this.topicProgressService.update(id, updateTopicProgressDTO);
  }
}
