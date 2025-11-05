import { Controller, Get, UseGuards } from '@nestjs/common';

import { AuthGuard } from '@nestjs/passport';

import { GetUser } from 'src/users/presentation/decorators/get_user.decorator';

import type { JwtPayload } from 'src/auth/interface/jwt-payload.interface';

import { GroupsService, GroupsForPeriods } from '../application/groups.service';

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
}
