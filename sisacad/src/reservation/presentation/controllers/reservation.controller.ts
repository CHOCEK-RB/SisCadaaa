import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ReservationService } from '../../application/services/reservation.service';
import { CreateReservationDto } from '../../application/dto/create-reservation.dto';
import { JwtAuthGuard } from '../../../auth/presentation/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/presentation/guards/roles.guard';
import { Roles } from '../../../auth/presentation/decorators/roles.decorator';
import { Role } from '../../../users/domain/aggregates/role.enum';
import { GetUser } from 'src/auth/presentation/decorators/get-user.decorator';
import { User } from 'src/users/domain/aggregates/user.entity';

@Controller('reservations')
@UseGuards(JwtAuthGuard)
export class ReservationController {
  constructor(private readonly reservationService: ReservationService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.SECRETARY, Role.TEACHER)
  create(
    @Body() createReservationDto: CreateReservationDto,
    @GetUser() user: User,
  ) {
    return this.reservationService.createReservation(
      createReservationDto,
      user,
    );
  }

  @Get('my-reservations')
  getMyReservations(@GetUser() user: User) {
    return this.reservationService.getReservationsByUserId(user.id);
  }

  @Get('active')
  getActiveReservations() {
    return this.reservationService.getActiveReservations();
  }

  @Get('today')
  getReservationsForToday() {
    return this.reservationService.getReservationsForToday();
  }

  @Get('user/:userId')
  getReservationsByUserId(@Param('userId', ParseUUIDPipe) userId: string) {
    return this.reservationService.getReservationsByUserId(userId);
  }

  @Get('classroom/:classroomId')
  getReservationsByClassroomId(
    @Param('classroomId', ParseUUIDPipe) classroomId: string,
  ) {
    return this.reservationService.getReservationsByClassroomId(classroomId);
  }
}
