import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { AcademicGroup } from '../aggregates/academic_group.entity';
import { ScheduleSlot, DayOfWeek } from '../aggregates/schedule.entity';
import { Classroom } from 'src/classroom/aggregates/classrom.entity';

import { IScheduleSlotRepository } from './ischedule.repository';

@Injectable()
export class ScheduleSlotRepository implements IScheduleSlotRepository {
  constructor(
    @InjectRepository(ScheduleSlot)
    private readonly typeormRepo: Repository<ScheduleSlot>,
  ) {}

  async findById(id: string): Promise<ScheduleSlot | null> {
    return this.typeormRepo.findOne({ where: { id } });
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
}
