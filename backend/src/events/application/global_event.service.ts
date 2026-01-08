import { Injectable, Inject, BadRequestException } from "@nestjs/common";
import {
  GlobalEvent,
  EventType,
} from "../domain/aggregates/global_event.entity";
import { IGlobalEventRepository } from "../domain/repositories/iglobal_event.repository";
import { Not, LessThanOrEqual, MoreThanOrEqual } from "typeorm";

/**
 * @class GlobalEventService
 * @description
 * Service responsible for managing and querying global academic events.
 * It provides functionality to check the active status of different event types
 * (e.g., academic periods, grading periods, lab enrollment periods).
 */
@Injectable()
export class GlobalEventService {
  /**
   * @constructor
   * @param {IGlobalEventRepository} eventRepository - Repository for global event data operations.
   */
  constructor(
    @Inject(IGlobalEventRepository)
    private readonly eventRepository: IGlobalEventRepository,
  ) {}

  /**
   * @method isEventActive
   * @description
   * Checks if a specific type of global event is currently active.
   * @param {EventType} type - The type of the global event to check (e.g., ACADEMIC, GRADING, LAB_ENROLLMENT).
   * @returns {Promise<boolean>} A promise that resolves to true if an active event of the specified type is found, false otherwise.
   */
  async isEventActive(type: EventType): Promise<boolean> {
    const activeEvent = await this.eventRepository.findActive(type);
    return !!activeEvent;
  }

  async findAllAcademicPeriods(): Promise<GlobalEvent[]> {
    return this.eventRepository.findAllByType(EventType.ACADEMIC);
  }

  // NEW METHOD
  async findActiveAcademicPeriods(): Promise<GlobalEvent[]> {
    return this.eventRepository.findAllActiveByType(EventType.ACADEMIC);
  }

  async createEvent(event: GlobalEvent): Promise<GlobalEvent> {
    if (
      (event.type === EventType.LAB_ENROLLMENT || event.type === EventType.GRADING) &&
      event.isActive
    ) {
      await this._ensureSingleActiveEventType(event.type, event);
    }
    return this.eventRepository.create(event);
  }

  async findEventById(id: string): Promise<GlobalEvent | null> {
    return this.eventRepository.findById(id);
  }

  async findAllEvents(): Promise<GlobalEvent[]> {
    return this.eventRepository.findAll();
  }

  async updateEvent(event: GlobalEvent): Promise<GlobalEvent> {
    if (
      (event.type === EventType.LAB_ENROLLMENT || event.type === EventType.GRADING) &&
      event.isActive
    ) {
      await this._ensureSingleActiveEventType(event.type, event, event.id);
    }
    return this.eventRepository.update(event);
  }

  async deleteEvent(id: string): Promise<void> {
    return this.eventRepository.delete(id);
  }

  private async _ensureSingleActiveEventType(
    type: EventType,
    newEvent: GlobalEvent,
    currentEventId?: string,
  ): Promise<void> {
    // Find all *other* active events of the same type that overlap with newEvent's date range
    const overlappingEvents = await this.eventRepository.find({
      where: {
        type: type,
        isActive: true,
        // Overlap condition: (StartA <= EndB AND EndA >= StartB)
        startDate: LessThanOrEqual(newEvent.endDate),
        endDate: MoreThanOrEqual(newEvent.startDate),
        ...(currentEventId && { id: Not(currentEventId) }), // Exclude current event if it's an update
      },
    });

    if (overlappingEvents.length > 0) {
      throw new BadRequestException(
        `Only one active ${type} event is allowed at a time. An overlapping active event already exists.`,
      );
    }
  }
}
