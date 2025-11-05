import {
  Controller,
  Get,
  UseGuards,
  Param,
  ParseUUIDPipe,
} from '@nestjs/common';

import { AuthGuard } from '@nestjs/passport';

import { GetUser } from 'src/users/presentation/decorators/get_user.decorator';

import type { JwtPayload } from 'src/auth/interface/jwt-payload.interface';

import { GroupsService, GroupsForPeriods } from '../application/groups.service';
import { AcademicGroupDTO } from '../application/academic_group.dto';
import { AcademicCourseDTO } from 'src/courses/application/dto/academic_course.dto';

@Controller('groups')
@UseGuards(AuthGuard('jwt'))
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @Get('/teacher')
  @UseGuards(AuthGuard('jwt'))
  async getAllGroupsForTeacher(
    @GetUser() user: JwtPayload,
  ): Promise<GroupsForPeriods> {
    return await this.groupsService.getAllGroupsForTeacher(user);
  }

  @Get('/schedule/:id')
  @UseGuards(AuthGuard('jwt'))
  async getSchedule(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<AcademicGroupDTO[]> {
    return await this.groupsService.getSchedule(id);
  }

  @Get('/course/:id')
  @UseGuards(AuthGuard('jwt'))
  async getAcademicCourse(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<AcademicCourseDTO> {
    return await this.groupsService.getAcademicCourse(id);
  }
}
