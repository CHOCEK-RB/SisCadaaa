import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Attendance, LocationStatus } from '../aggregates/attendance.entity';
import { IAttendanceRepository } from './iattendance.repository';
import { AcademicGroup } from 'src/groups/aggregates/academic_group.entity';
import { Teacher } from 'src/users/aggregates/teacher.entity';

@Injectable()
export class AttendanceRepository implements IAttendanceRepository {
  constructor(
    @InjectRepository(Attendance)
    private readonly typeormRepo: Repository<Attendance>,
  ) {}

  async findById(id: string): Promise<Attendance | null> {
    return this.typeormRepo.findOne({
      where: { id },
      relations: ['academicGroup'],
    });
  }

  async findByGroupAndDate(
    groupId: string,
    date: Date,
  ): Promise<Attendance | null> {
    return this.typeormRepo.findOne({
      where: {
        academicGroup: { id: groupId },
        classDate: date,
      },
    });
  }

  save(attendance: Attendance[]): Promise<Attendance[]>;
  save(attendance: Attendance): Promise<Attendance>;

  async save(
    attendanceOrAttendances: Attendance | Attendance[],
  ): Promise<Attendance | Attendance[]> {
    if (Array.isArray(attendanceOrAttendances)) {
      return this.typeormRepo.save(attendanceOrAttendances);
    } else {
      return this.typeormRepo.save(attendanceOrAttendances);
    }
  }

  async findByGroupIds(groupIds: string[]): Promise<Attendance[]> {
    if (!groupIds || groupIds.length === 0) {
      return [];
    }
    return this.typeormRepo.find({
      where: {
        academicGroup: { id: In(groupIds) },
      },
      relations: ['academicGroup'],
      order: {
        classDate: 'ASC',
      },
    });
  }

  async create(
    teacher: Teacher,
    ipAddress: string,
    location: LocationStatus,
    group: AcademicGroup,
  ): Promise<Attendance> {
    const newAttendance = this.typeormRepo.create({
      teacher: teacher,
      ipAddress: ipAddress,
      location: location,
      academicGroup: group,
      classDate: new Date(),
      studentStatuses: {},
    });
    return this.typeormRepo.save(newAttendance);
  }
}
