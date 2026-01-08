import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  ParseEnumPipe,
  ParseUUIDPipe,
  NotFoundException,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { GlobalEventService } from '../../application/global_event.service';
import {
  GlobalEvent,
  EventType,
} from '../../domain/aggregates/global_event.entity';
import { CreateGlobalEventDto } from '../../application/dto/create-global-event.dto';
import { UpdateGlobalEventDto } from '../../application/dto/update-global-event.dto';

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

  @Get('active-periods') // NEW ENDPOINT
  async findActiveAcademicPeriods(): Promise<GlobalEvent[]> {
    return await this.eventService.findActiveAcademicPeriods(); // NEW SERVICE METHOD
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createEvent(
    @Body() createGlobalEventDto: CreateGlobalEventDto,
  ): Promise<GlobalEvent> {
    const newEvent = new GlobalEvent();
    Object.assign(newEvent, createGlobalEventDto);
    return this.eventService.createEvent(newEvent);
  }

  @Get()
  async findAllEvents(): Promise<GlobalEvent[]> {
    return this.eventService.findAllEvents();
  }

  @Get(':id')
  async findEventById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<GlobalEvent> {
    const event = await this.eventService.findEventById(id);
    if (!event) {
      throw new NotFoundException(`Event with ID "${id}" not found`);
    }
    return event;
  }

  @Patch(':id')
  async updateEvent(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateGlobalEventDto: UpdateGlobalEventDto,
  ): Promise<GlobalEvent> {
    const existingEvent = await this.eventService.findEventById(id);
    if (!existingEvent) {
      throw new NotFoundException(`Event with ID "${id}" not found`);
    }

    Object.assign(existingEvent, updateGlobalEventDto);
    return this.eventService.updateEvent(existingEvent);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteEvent(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    const existingEvent = await this.eventService.findEventById(id);
    if (!existingEvent) {
      throw new NotFoundException(`Event with ID "${id}" not found`);
    }
    await this.eventService.deleteEvent(id);
  }
}
