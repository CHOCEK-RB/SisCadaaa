import {
  Controller,
  Get,
  Param,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';

import { AuthGuard } from '@nestjs/passport';
import { AcademicCourseService } from '../application/academic_course.service';
import { AcademicCourseDTO } from '../application/dto/academic_course.dto';

@Controller('academic-courses')
@UseGuards(AuthGuard('jwt'))
export class AcademicCourseController {
  constructor(private readonly academicCourseService: AcademicCourseService) {}

  @Get(':id')
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<AcademicCourseDTO> {
    return this.academicCourseService.findDetailsById(id);
  }
}
