import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IClassroomRepository } from '../../domain/repositories/iclassroom.repository';
import { Classroom } from '../../domain/aggregates/classroom.entity';
import { IAcademicGroupRepository } from 'src/groups/domain/repositories/iacademic_group.repository';
import { IReservationRepository } from 'src/reservation/domain/repositories/ireservation.repository';

@Injectable()
export class ClassroomService {
  constructor(
    @Inject(IClassroomRepository)
    private readonly classroomRepository: IClassroomRepository,
    @Inject(IAcademicGroupRepository)
    private readonly groupRepository: IAcademicGroupRepository,
    @Inject(IReservationRepository)
    private readonly reservationRepository: IReservationRepository,
  ) {}

  async findAll(): Promise<Classroom[] | null> {
    return this.classroomRepository.findAll();
  }

  async findById(id: string): Promise<Classroom> {
    const classroom = await this.classroomRepository.findById(id);
    if (!classroom) {
      throw new NotFoundException(`Classroom with ID ${id} not found`);
    }
    return classroom;
  }

  async getSchedule(classroomId: string) {
    await this.findById(classroomId);

    const academicGroups =
      await this.groupRepository.findByClassroomId(classroomId);

    const activeReservations =
      await this.reservationRepository.findByClassroomId(classroomId);

    const transformedGroups = academicGroups.map((group) => ({
      ...group,
      schedule: group.schedule.map((slot) => ({
        ...slot,
        start: slot.startTime,
        end: slot.endTime,
      })),
    }));

    return {
      academicGroups: transformedGroups,
      reservations: activeReservations,
    };
  }
}
