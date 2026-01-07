import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { GlobalEvent } from "./domain/aggregates/global_event.entity";
import { IGlobalEventRepository } from "./domain/repositories/iglobal_event.repository";
import { GlobalEventRepository } from "./infrastructure/global_event.repository";
import { GlobalEventService } from "./application/global_event.service";
import { EventsController } from "./presentation/controllers/events.controller";

@Module({
  imports: [TypeOrmModule.forFeature([GlobalEvent])],
  controllers: [EventsController],
  providers: [
    GlobalEventService,
    {
      provide: IGlobalEventRepository,
      useClass: GlobalEventRepository,
    },
  ],
  exports: [GlobalEventService, IGlobalEventRepository],
})
export class EventsModule {}
