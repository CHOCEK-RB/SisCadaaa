import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { AcademicGroup } from '../domain/aggregates/academic_group.entity';
import { ScheduleSlot, DayOfWeek } from '../domain/aggregates/schedule.entity';
import { Classroom } from 'src/classroom/domain/aggregates/classroom.entity';

import { IScheduleSlotRepository } from '../domain/repositories/ischedule.repository';

@Injectable()
export class ScheduleSlotRepository implements IScheduleSlotRepository {
  constructor(
    @InjectRepository(ScheduleSlot)
    private readonly typeormRepo: Repository<ScheduleSlot>,
  ) {}

  async findById(id: string): Promise<ScheduleSlot | null> {
    return this.typeormRepo.findOne({ where: { id } });
  }

  async findByIdWithAcademicGroup(id: string): Promise<ScheduleSlot | null> {
    return this.typeormRepo.findOne({
      where: { id },
      relations: ['academicGroup'], // Eager-load the academicGroup relation
    });
  }

  async findByAcademicGroup(groupId: string): Promise<ScheduleSlot[] | null> {
    return this.typeormRepo.find({ where: { academicGroup: { id: groupId } } });
  }

  async findByClassroom(classromId: string): Promise<ScheduleSlot[] | null> {
    return this.typeormRepo.find({ where: { classroom: { id: classromId } } });
  }

  save(schedule: ScheduleSlot): Promise<ScheduleSlot>;
  save(schedules: ScheduleSlot[]): Promise<ScheduleSlot[]>;
  async save(
    scheduleOrSchedules: ScheduleSlot | ScheduleSlot[],
  ): Promise<ScheduleSlot | ScheduleSlot[]> {
    if (Array.isArray(scheduleOrSchedules)) {
      return this.typeormRepo.save(scheduleOrSchedules);
    } else {
      return this.typeormRepo.save(scheduleOrSchedules);
    }
  }

  async create(
    day: DayOfWeek,
    startTime: string,
    endTime: string,
    classroom: Classroom,
    group: AcademicGroup,
  ): Promise<ScheduleSlot> {
    const newSchedule = this.typeormRepo.create({
      day: day,
      startTime: startTime,
      endTime: endTime,
      classroom: classroom,
      academicGroup: group,
    });

    return this.typeormRepo.save(newSchedule);
  }

  async findOverlappingScheduleSlots(
    classroomId: string,
    dayOfWeek: DayOfWeek,
    startTime: string,
    endTime: string,
  ): Promise<ScheduleSlot[]> {
    return this.typeormRepo
      .createQueryBuilder('scheduleSlot')
      .where('scheduleSlot.classroom.id = :classroomId', { classroomId })
      .andWhere('scheduleSlot.day = :dayOfWeek', { dayOfWeek })
      .andWhere(
        '(:startTime < scheduleSlot.endTime AND :endTime > scheduleSlot.startTime)',
        { startTime, endTime },
      )
      .getMany();
  }

  async findConflictingSchedule(
    academicGroupId: string, // Keep for now as it's passed from GroupsService, but not used in query
    classroomId: string,
    day: DayOfWeek,
    startTime: string,
    endTime: string,
  ): Promise<ScheduleSlot | null> {
    return this.typeormRepo
      .createQueryBuilder('scheduleSlot')
      .where('scheduleSlot.classroom.id = :classroomId', { classroomId })
      .andWhere('scheduleSlot.day = :day', { day })
      .andWhere(
        '(:startTime < scheduleSlot.endTime AND :endTime > scheduleSlot.startTime)',
        { startTime, endTime },
      )
      .getOne();
  }

  async findAcademicGroupConflict(
    academicGroupId: string,
    day: DayOfWeek,
    startTime: string,
    endTime: string,
  ): Promise<ScheduleSlot | null> {
    return this.typeormRepo
      .createQueryBuilder('scheduleSlot')
      .where('scheduleSlot.academicGroup.id = :academicGroupId', { academicGroupId })
      .andWhere('scheduleSlot.day = :day', { day })
      .andWhere(
        '(:startTime < scheduleSlot.endTime AND :endTime > scheduleSlot.startTime)',
        { startTime, endTime },
      )
      .getOne();
  }

  async delete(id: string): Promise<void> {
    await this.typeormRepo.delete(id);
  }
}
