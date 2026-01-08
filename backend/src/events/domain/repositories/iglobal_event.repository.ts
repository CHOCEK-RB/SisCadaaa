import { GlobalEvent, EventType } from "../aggregates/global_event.entity";
import { FindOneOptions, FindManyOptions } from "typeorm";

export const IGlobalEventRepository = Symbol("IGlobalEventRepository");

export interface IGlobalEventRepository {
  findActive(type: EventType): Promise<GlobalEvent | null>;
  findOne(options: FindOneOptions<GlobalEvent>): Promise<GlobalEvent | null>;
  findAllByType(type: EventType): Promise<GlobalEvent[]>;
  findAllActiveByType(type: EventType): Promise<GlobalEvent[]>;
  create(event: GlobalEvent): Promise<GlobalEvent>;
  findById(id: string): Promise<GlobalEvent | null>;
  findAll(): Promise<GlobalEvent[]>;
  find(options: FindManyOptions<GlobalEvent>): Promise<GlobalEvent[]>; // New method
  update(event: GlobalEvent): Promise<GlobalEvent>;
  delete(id: string): Promise<void>;
  save(event: Partial<GlobalEvent>): Promise<GlobalEvent>;
  save(events: Partial<GlobalEvent>[]): Promise<GlobalEvent[]>;
}
