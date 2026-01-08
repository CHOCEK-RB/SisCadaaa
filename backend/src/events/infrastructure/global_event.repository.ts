import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import {
  FindOneOptions,
  FindManyOptions, // Added FindManyOptions
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
    return await this.eventRepository.find({ where: { type } });
  }

  async findAllActiveByType(type: EventType): Promise<GlobalEvent[]> {
    const now = new Date();

    return await this.eventRepository.find({
      where: {
        type: type,
        isActive: true,
        startDate: LessThanOrEqual(now),
        endDate: MoreThanOrEqual(now),
      },
    });
  }

  async create(event: GlobalEvent): Promise<GlobalEvent> {
    return await this.eventRepository.save(event);
  }

  async findById(id: string): Promise<GlobalEvent | null> {
    return await this.eventRepository.findOneBy({ id });
  }

  async findAll(): Promise<GlobalEvent[]> {
    return await this.eventRepository.find();
  }

  // New find method implementation
  async find(options: FindManyOptions<GlobalEvent>): Promise<GlobalEvent[]> {
    return await this.eventRepository.find(options);
  }

  async update(event: GlobalEvent): Promise<GlobalEvent> {
    const existingEvent = await this.eventRepository.findOneBy({ id: event.id });
    if (!existingEvent) {
      throw new Error('Event not found'); // Or handle this more gracefully, e.g., throw NotFoundException
    }
    return await this.eventRepository.save(event);
  }

  async delete(id: string): Promise<void> {
    await this.eventRepository.delete(id);
  }

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