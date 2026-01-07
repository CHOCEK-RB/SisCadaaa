import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import {
  FindOneOptions,
  Repository,
  LessThanOrEqual,
  MoreThanOrEqual,
} from "typeorm";
import {
  GlobalEvent,
  EventType,
} from "../domain/aggregates/global_event.entity";
import { IGlobalEventRepository } from "../domain/repositories/iglobal_event.repository";

@Injectable()
export class GlobalEventRepository implements IGlobalEventRepository {
  constructor(
    @InjectRepository(GlobalEvent)
    private readonly eventRepository: Repository<GlobalEvent>,
  ) {}

  async findActive(type: EventType): Promise<GlobalEvent | null> {
    const now = new Date();

    return await this.eventRepository.findOne({
      where: {
        type: type,
        isActive: true,
        startDate: LessThanOrEqual(now),
        endDate: MoreThanOrEqual(now),
      },
    });
  }

  async findOne(
    options: FindOneOptions<GlobalEvent>,
  ): Promise<GlobalEvent | null> {
    return await this.eventRepository.findOne(options);
  }

  async findAllByType(type: EventType): Promise<GlobalEvent[]> {
    // Added
    return await this.eventRepository.find({ where: { type } }); // Added
  } // Added

  async save(event: Partial<GlobalEvent>): Promise<GlobalEvent>;
  async save(events: Partial<GlobalEvent>[]): Promise<GlobalEvent[]>;
  async save(
    eventOrEvents: Partial<GlobalEvent> | Partial<GlobalEvent>[],
  ): Promise<GlobalEvent | GlobalEvent[]> {
    if (Array.isArray(eventOrEvents)) {
      return await this.eventRepository.save(eventOrEvents);
    } else {
      return await this.eventRepository.save(eventOrEvents);
    }
  }
}
