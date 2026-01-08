import { Injectable, Inject } from "@nestjs/common";
import {
  GlobalEvent,
  EventType,
} from "../domain/aggregates/global_event.entity";
import { IGlobalEventRepository } from "../domain/repositories/iglobal_event.repository";

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
}
