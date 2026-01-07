import { Controller, Get, Param, ParseEnumPipe } from '@nestjs/common';
import { GlobalEventService } from '../../application/global_event.service';
import { GlobalEvent, EventType } from '../../domain/aggregates/global_event.entity';

/**
 * @class EventsController
 * @description
 * Controller responsible for handling HTTP requests related to global academic events.
 * It provides an endpoint to check the active status of different types of events.
 */
@Controller('events')
export class EventsController {
  /**
   * @constructor
   * @param {GlobalEventService} eventService - Service for managing global event business logic.
   */
  constructor(private readonly eventService: GlobalEventService) {}

  /**
   * @method getEventStatus
   * @description
   * Retrieves the active status of a specific global event type.
   * @param {EventType} type - The type of the global event to check (e.g., ACADEMIC, GRADING, LAB_ENROLLMENT).
   * @returns {Promise<{ isActive: boolean }>} A promise that resolves to an object indicating whether the event type is currently active.
   */
  @Get('status/:type')
  async getEventStatus(
    @Param('type', new ParseEnumPipe(EventType)) type: EventType,
  ): Promise<{ isActive: boolean }> {
    const isActive = await this.eventService.isEventActive(type);
    return { isActive };
  }

  @Get('periods')
  async findAllAcademicPeriods(): Promise<GlobalEvent[]> {
    return await this.eventService.findAllAcademicPeriods();
  }
}
