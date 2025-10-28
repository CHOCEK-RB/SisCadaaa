import {
  Controller,
  Post,
  Body,
  Param,
  Patch,
  HttpCode,
  HttpStatus,
  Get,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { UserService, AnyProfileDTO } from '../application/user.service';
import { PreRegisterUserDto } from '../application/pre-register-user.dto';
import { GetUser } from './decorators/get_user.decorator';

interface AuthenticatedUserInfo {
  id: string;
  email: string;
  pictureURL?: string;
  isActive: boolean;
}

@Controller('users')
export class UsersController {
  constructor(private readonly userService: UserService) {}

  @Get('profile')
  @UseGuards(AuthGuard('jwt'))
  async getMyProfile(
    @GetUser() user: AuthenticatedUserInfo,
  ): Promise<AnyProfileDTO> {
    return await this.userService.getUserProfile(user.id);
  }

  @Post('pre-register')
  @HttpCode(HttpStatus.CREATED)
  preRegisterUser(@Body() preRegisterUserDto: PreRegisterUserDto) {
    return this.userService.preRegisterUser(preRegisterUserDto);
  }

  @Patch(':id/activate')
  @HttpCode(HttpStatus.OK)
  activateUser(@Param('id') userId: string) {
    return this.userService.activateUser(userId);
  }
}
