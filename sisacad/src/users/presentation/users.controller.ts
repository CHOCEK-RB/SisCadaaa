import {
  Controller,
  Post,
  Body,
  Param,
  Patch,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';

import { UsersApplicationService } from '../application/users.application.service';
import { PreRegisterUserDto } from '../application/pre-register-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersApplicationService) {}

  @Post('pre-register')
  @HttpCode(HttpStatus.CREATED)
  preRegisterUser(@Body() preRegisterUserDto: PreRegisterUserDto) {
    return this.usersService.preRegisterUser(preRegisterUserDto);
  }

  @Patch(':id/activate')
  @HttpCode(HttpStatus.OK)
  activateUser(@Param('id') userId: string) {
    return this.usersService.activateUser(userId);
  }
}
