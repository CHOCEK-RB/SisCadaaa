import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { GlobalEventService } from 'src/events/application/global_event.service';
import { EventType } from 'src/events/domain/aggregates/global_event.entity';

@Injectable()
export class GradingPeriodActiveGuard implements CanActivate {
  constructor(private readonly eventService: GlobalEventService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isActive = await this.eventService.isEventActive(
      EventType.GRADING,
    );

    if (!isActive) {
      throw new ForbiddenException(
        'El período para registrar o modificar notas no está activo.',
      );
    }
    return true;
  }
}
