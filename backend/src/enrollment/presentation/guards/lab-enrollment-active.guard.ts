import { CanActivate, Injectable, ForbiddenException } from '@nestjs/common';
import { GlobalEventService } from 'src/events/application/global_event.service';
import { EventType } from 'src/events/domain/aggregates/global_event.entity';

@Injectable()
export class LabEnrollmentActiveGuard implements CanActivate {
  constructor(private readonly eventService: GlobalEventService) {}

  async canActivate(): Promise<boolean> {
    const isActive = await this.eventService.isEventActive(
      EventType.LAB_ENROLLMENT,
    );

    if (!isActive) {
      throw new ForbiddenException(
        'El período de matrícula de laboratorios no está activo.',
      );
    }
    return true;
  }
}

