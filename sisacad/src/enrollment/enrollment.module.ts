import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Enrollment } from './domain/aggregates/enrollment.entity';

import { EnrollmentController } from './presentation/controllers/enrollment.controller';
import { EnrollmentService } from './application/services/enrollment.service';
import { EnrollmentQueryService } from './application/services/enrollment-query.service';
import { EnrollmentLabGroupService } from './application/services/enrollment-lab-group.service';
import { EnrollmentMapper } from './application/mappers/enrollment.mapper';

import { IEnrollmentRepository } from './domain/repositories/ienrollment.repository';
import { EnrollmentRepository } from './infrastructure/persistence/postgres/enrollment.repository';

import { UserModule } from 'src/users/users.module';
import { GroupsModule } from 'src/groups/groups.module';
import { EventsModule } from 'src/events/events.module';

/**
 * @module EnrollmentModule
 * @description
 * Main module for handling all student enrollment-related functionalities.
 * It manages the lifecycle of enrollments, including queries, lab group assignments,
 * and persistence.
 */
@Module({
  controllers: [EnrollmentController], // Registers EnrollmentController to handle enrollment-related API requests.
  imports: [
    TypeOrmModule.forFeature([Enrollment]), // Registers the Enrollment entity with TypeORM.
    forwardRef(() => UserModule), // Resolves circular dependency with UserModule. Provides access to user data.
    forwardRef(() => GroupsModule), // Resolves circular dependency with GroupsModule. Provides access to academic group data.
    EventsModule, // Imports EventsModule for event-related services (e.g., academic period status).
  ],
  providers: [
    EnrollmentService, // Provides core enrollment business logic.
    EnrollmentQueryService, // Handles queries related to enrollment data (e.g., student grades, schedules).
    EnrollmentLabGroupService, // Manages logic for enrolling students in lab groups.
    EnrollmentMapper, // Maps enrollment-related entities to DTOs and vice-versa.
    {
      provide: IEnrollmentRepository, // Provides the interface for the enrollment repository.
      useClass: EnrollmentRepository, // Implements the IEnrollmentRepository using PostgreSQL persistence.
    },
  ],
  exports: [
    IEnrollmentRepository, // Exports the repository for other modules to interact with enrollment data.
    EnrollmentQueryService, // Exports query service for other modules to fetch enrollment data.
    EnrollmentLabGroupService, // Exports lab group enrollment service for other modules.
  ],
})
export class EnrollmentModule {}
