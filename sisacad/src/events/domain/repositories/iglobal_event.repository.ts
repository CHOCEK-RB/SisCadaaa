import { GlobalEvent, EventType } from '../aggregates/global_event.entity';
import { FindOneOptions } from 'typeorm';

export const IGlobalEventRepository = Symbol('IGlobalEventRepository');

export interface IGlobalEventRepository {
  findActive(type: EventType): Promise<GlobalEvent | null>;
  findOne(options: FindOneOptions<GlobalEvent>): Promise<GlobalEvent | null>;
  save(event: Partial<GlobalEvent>): Promise<GlobalEvent>;
  save(events: Partial<GlobalEvent>[]): Promise<GlobalEvent[]>;
}

