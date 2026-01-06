import { Controller, Get, Param, ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { ClassroomService } from '../../application/services/classroom.service';
import { JwtAuthGuard } from 'src/auth/presentation/guards/jwt-auth.guard';

@Controller('classrooms')
@UseGuards(JwtAuthGuard)
export class ClassroomController {
  constructor(private readonly classroomService: ClassroomService) {}

  @Get()
  findAll() {
    return this.classroomService.findAll();
  }

  @Get(':id')
  findById(@Param('id', ParseUUIDPipe) id: string) {
    return this.classroomService.findById(id);
  }

  @Get(':id/schedule')
  getSchedule(@Param('id', ParseUUIDPipe) id: string) {
    return this.classroomService.getSchedule(id);
  }
}
