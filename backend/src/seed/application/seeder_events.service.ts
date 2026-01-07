import { Injectable, Inject } from '@nestjs/common';
import { IGlobalEventRepository } from 'src/events/domain/repositories/iglobal_event.repository';
import {
  GlobalEvent,
  EventType,
} from 'src/events/domain/aggregates/global_event.entity';

/**
 * @class SeederEventsService
 * @description
 * Service responsible for seeding predefined global events into the database.
 * These events include academic periods, grading periods, and lab enrollment periods,
 * ensuring the system has initial event data for operational logic.
 */
@Injectable()
export class SeederEventsService {
  /**
   * @constructor
   * @param {IGlobalEventRepository} eventRepository - Repository for global event data operations.
   */
  constructor(
    @Inject(IGlobalEventRepository)
    private readonly eventRepository: IGlobalEventRepository,
  ) {}

  /**
   * @method seedEvents
   * @description
   * Seeds a set of predefined global events (Academic Period, Grading Period, Lab Enrollment).
   * It checks for existing events by name and type to prevent duplicates before saving new ones.
   * Logs success or failure of the seeding process.
   * @returns {Promise<void>} A promise that resolves when all events have been seeded or verified.
   * @throws {Error} If there is a failure during the event saving process.
   */
  async seedEvents(): Promise<void> {
    const eventsToCreate: Partial<GlobalEvent>[] = [];

    // Academic Periods
    eventsToCreate.push({
      name: 'Período Académico 2021-A',
      type: EventType.ACADEMIC,
      startDate: new Date('2021-02-01T00:00:00Z'),
      endDate: new Date('2021-07-31T23:59:59Z'),
      isActive: true,
    });
    eventsToCreate.push({
      name: 'Período Académico 2021-B',
      type: EventType.ACADEMIC,
      startDate: new Date('2021-08-01T00:00:00Z'),
      endDate: new Date('2021-12-31T23:59:59Z'),
      isActive: true,
    });
    eventsToCreate.push({
      name: 'Período Académico 2022-A',
      type: EventType.ACADEMIC,
      startDate: new Date('2022-02-01T00:00:00Z'),
      endDate: new Date('2022-07-31T23:59:59Z'),
      isActive: true,
    });
    eventsToCreate.push({
      name: 'Período Académico 2022-B',
      type: EventType.ACADEMIC,
      startDate: new Date('2022-08-01T00:00:00Z'),
      endDate: new Date('2022-12-31T23:59:59Z'),
      isActive: true,
    });
    eventsToCreate.push({
      name: 'Período Académico 2023-A',
      type: EventType.ACADEMIC,
      startDate: new Date('2023-02-01T00:00:00Z'),
      endDate: new Date('2023-07-31T23:59:59Z'),
      isActive: true,
    });
    eventsToCreate.push({
      name: 'Período Académico 2023-B',
      type: EventType.ACADEMIC,
      startDate: new Date('2023-08-01T00:00:00Z'),
      endDate: new Date('2023-12-31T23:59:59Z'),
      isActive: true,
    });
    eventsToCreate.push({
      name: 'Período Académico 2024-A',
      type: EventType.ACADEMIC,
      startDate: new Date('2024-02-01T00:00:00Z'),
      endDate: new Date('2024-07-31T23:59:59Z'),
      isActive: true,
    });
    eventsToCreate.push({
      name: 'Período Académico 2024-B',
      type: EventType.ACADEMIC,
      startDate: new Date('2024-08-01T00:00:00Z'),
      endDate: new Date('2024-12-31T23:59:59Z'),
      isActive: true,
    });
    eventsToCreate.push({
      name: 'Período Académico 2025-A',
      type: EventType.ACADEMIC,
      startDate: new Date('2025-02-01T00:00:00Z'),
      endDate: new Date('2025-07-31T23:59:59Z'),
      isActive: true,
    });
    eventsToCreate.push({
      name: 'Período Académico 2025-B',
      type: EventType.ACADEMIC,
      startDate: new Date('2025-08-01T00:00:00Z'),
      endDate: new Date('2025-12-31T23:59:59Z'),
      isActive: true,
    });


    // Other events
    eventsToCreate.push({
      name: 'Registro de Notas Finales 2025-II',
      type: EventType.GRADING,
      startDate: new Date('2025-12-16T00:00:00Z'),
      endDate: new Date('2025-12-22T23:59:59Z'),
      isActive: true,
    });

    eventsToCreate.push({
      name: 'Matrícula de Laboratorios 2025-II',
      type: EventType.LAB_ENROLLMENT,
      startDate: new Date('2025-07-20T00:00:00Z'),
      endDate: new Date('2025-12-11T23:59:59Z'),
      isActive: true,
    });

    try {
      for (const eventData of eventsToCreate) {
        const existing = await this.eventRepository.findOne({
          where: { name: eventData.name, type: eventData.type },
        });
        if (!existing) {
          await this.eventRepository.save(eventData as GlobalEvent);
        }
      }
      console.log(
        `Successfully seeded/verified ${eventsToCreate.length} global events.`,
      );
    } catch (error) {
      console.error('Failed to save global events:', error);
      throw error;
    }
  }
}
