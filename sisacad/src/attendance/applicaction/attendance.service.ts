import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { IAttendanceRepository } from '../infrastructure/iattendance.repository';
import { IEnrollmentRepository } from 'src/enrollment/infrastructure/ienrollment.repository';
import { IStudentRepository } from 'src/users/infrastructure/istudent.repository';
import { ITeacherRepository } from 'src/users/infrastructure/iteacher.repository';
import { IAcademicGroupRepository } from 'src/groups/infrastructure/iacademic_group.repository';
import { JwtPayload } from 'src/auth/interface/jwt-payload.interface';
import {
  GroupAttendanceDTO,
  StudentCourseAttendanceDTO,
} from './dto/attendance.dto';

import { LocationStatus } from '../aggregates/attendance.entity';

import { AttendanceStatus } from '../aggregates/attendance.entity';
import { DayOfWeek } from 'src/groups/aggregates/schedule.entity';

export interface StudentAttendanceInfo {
  studentId: string;
  cui: string;
  firstName: string;
  lastName: string;
  status: AttendanceStatus;
}

export interface GroupAttendanceRecord {
  attendanceId: string;
  classDate: string;
  students: StudentAttendanceInfo[];
}

export interface TakeAttendanceResponse {
  canTakeAttendance: boolean;
  reason?: string;
  currentSchedule?: {
    day: string;
    start: string;
    end: string;
    classroom: string;
  };
  todayAttendance?: {
    attendanceId: string;
    students: StudentAttendanceInfo[];
  };
}

export interface UpdateAttendanceDto {
  studentStatuses: Record<string, AttendanceStatus>;
}

@Injectable()
export class AttendanceService {
  constructor(
    @Inject(IAttendanceRepository)
    private readonly attendanceRepository: IAttendanceRepository,
    @Inject(IEnrollmentRepository)
    private readonly enrollmentRepository: IEnrollmentRepository,
    @Inject(IStudentRepository)
    private readonly studentRepository: IStudentRepository,
    @Inject(ITeacherRepository)
    private readonly teacherRepository: ITeacherRepository,
    @Inject(IAcademicGroupRepository)
    private readonly academicGroupRepository: IAcademicGroupRepository,
  ) {}

  async getMyAttendanceForCourse(
    academicCourseId: string,
    authenticatedUser: JwtPayload,
  ): Promise<StudentCourseAttendanceDTO> {
    if (authenticatedUser.role !== 'student') {
      throw new ForbiddenException('Only students can view their attendance.');
    }

    const studentProfile = await this.studentRepository.findByUserId(
      authenticatedUser.sub,
    );
    if (!studentProfile) {
      throw new NotFoundException(
        `Student profile not found for user ID ${authenticatedUser.sub}.`,
      );
    }

    console.log(studentProfile);
    const studentId = studentProfile.id;

    const enrollment = await this.enrollmentRepository.findByStudentAndCourse(
      studentId,
      academicCourseId,
    );

    console.log(enrollment);

    if (!enrollment || !enrollment.groups || enrollment.groups.length === 0) {
      throw new NotFoundException(
        `Enrollment or associated groups not found for student ${studentId} in course ${academicCourseId}.`,
      );
    }

    const enrolledGroupIds = enrollment.groups.map((group) => group.id);

    const attendanceRecords =
      await this.attendanceRepository.findByGroupIds(enrolledGroupIds);

    const groupedAttendanceMap = new Map<string, GroupAttendanceDTO>();

    enrollment.groups.forEach((group) => {
      groupedAttendanceMap.set(group.id, {
        groupId: group.id,
        groupName: group.name,
        groupType: group.type,
        records: [],
        presentCount: 0,
        absentCount: 0,
        totalClasses: 0,
        attendancePercentage: 0,
      });
    });

    attendanceRecords.forEach((record) => {
      const studentStatus = record.studentStatuses[studentId];
      const groupId = record.academicGroup?.id;

      if (groupId && groupedAttendanceMap.has(groupId)) {
        const groupDTO = groupedAttendanceMap.get(groupId);

        if (!groupDTO) {
          throw new Error(
            `Group ${groupId} not found in groupedAttendanceMap.`,
          );
        }

        if (studentStatus) {
          groupDTO.records.push({
            classDate: record.classDate.toISOString(),
            status: studentStatus,
          });

          if (studentStatus === AttendanceStatus.PRESENT) {
            groupDTO.presentCount++;
          } else if (studentStatus === AttendanceStatus.ABSENT) {
            groupDTO.absentCount++;
          }

          groupDTO.totalClasses++;
        }
      } else {
        console.warn(
          `Attendance record ${record.id} references group ${groupId} which was not found in student enrollment groups.`,
        );
      }
    });

    const result = Array.from(groupedAttendanceMap.values()).map((groupDTO) => {
      groupDTO.attendancePercentage =
        groupDTO.totalClasses > 0
          ? Math.round((groupDTO.presentCount / groupDTO.totalClasses) * 100)
          : 0;

      return groupDTO;
    });

    return result;
  }

  private getDayOfWeek(date: Date): DayOfWeek {
    const days = [
      DayOfWeek.MONDAY,
      DayOfWeek.TUESDAY,
      DayOfWeek.WEDNESDAY,
      DayOfWeek.THURSDAY,
      DayOfWeek.FRIDAY,
    ];
    const dayIndex = date.getDay();
    // Domingo = 0, Lunes = 1, etc.
    if (dayIndex === 0 || dayIndex === 6) {
      throw new BadRequestException('No hay clases los fines de semana.');
    }
    return days[dayIndex - 1];
  }

  private isWithinSchedule(
    currentTime: Date,
    scheduleStart: string,
    scheduleEnd: string,
  ): boolean {
    const now = currentTime.getHours() * 60 + currentTime.getMinutes();

    const [startHour, startMin] = scheduleStart.split(':').map(Number);
    const [endHour, endMin] = scheduleEnd.split(':').map(Number);

    const start = startHour * 60 + startMin;
    const end = endHour * 60 + endMin;

    // Permitir 15 minutos antes y después del horario
    const buffer = 15;
    return now >= start - buffer && now <= end + buffer;
  }

  async checkCanTakeAttendance(
    groupId: string,
    authenticatedUser: JwtPayload,
  ): Promise<TakeAttendanceResponse> {
    if (authenticatedUser.role !== 'teacher') {
      return {
        canTakeAttendance: false,
        reason: 'Solo los profesores pueden tomar asistencia.',
      };
    }

    const teacherProfile = await this.teacherRepository.findByUserId(
      authenticatedUser.sub,
    );
    if (!teacherProfile) {
      return {
        canTakeAttendance: false,
        reason: 'Perfil de profesor no encontrado.',
      };
    }

    const group = await this.academicGroupRepository.getScheduleById(groupId);
    if (!group) {
      return {
        canTakeAttendance: false,
        reason: 'Grupo no encontrado.',
      };
    }

    if (!group.teacher || group.teacher.id !== teacherProfile.id) {
      return {
        canTakeAttendance: false,
        reason: 'No estás asignado a este grupo.',
      };
    }

    const now = new Date();
    const currentDay = this.getDayOfWeek(now);

    const todaySchedule = group.schedule.find(
      (slot) => slot.day === currentDay,
    );

    if (!todaySchedule) {
      return {
        canTakeAttendance: false,
        reason: 'No hay clase programada para hoy.',
      };
    }

    const withinSchedule = this.isWithinSchedule(
      now,
      todaySchedule.startTime,
      todaySchedule.endTime,
    );

    if (!withinSchedule) {
      return {
        canTakeAttendance: false,
        reason: `Fuera del horario de clase. La clase es de ${todaySchedule.startTime} a ${todaySchedule.endTime}.`,
        currentSchedule: {
          day: todaySchedule.day,
          start: todaySchedule.startTime,
          end: todaySchedule.endTime,
          classroom: todaySchedule.classroom.name,
        },
      };
    }

    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);

    const existingAttendance =
      await this.attendanceRepository.findByGroupAndDate(groupId, todayStart);

    let todayAttendance:
      | {
          attendanceId: string;
          students: StudentAttendanceInfo[];
        }
      | undefined = undefined;

    if (existingAttendance) {
      const allEnrollments = await this.enrollmentRepository.findAll();
      const relevantEnrollments = allEnrollments.filter(
        (enrollment) =>
          enrollment.course.id === group.academicCourse.id &&
          enrollment.groups.some((g) => g.id === groupId),
      );

      const students: StudentAttendanceInfo[] = relevantEnrollments.map(
        (enrollment) => ({
          studentId: enrollment.student.id,
          cui: enrollment.student.cui,
          firstName: enrollment.student.name,
          lastName:
            `${enrollment.student.firstLastName} ${enrollment.student.secondLastName}`.trim(),
          status:
            existingAttendance.studentStatuses[enrollment.student.id] ||
            AttendanceStatus.ABSENT,
        }),
      );

      students.sort((a, b) => a.lastName.localeCompare(b.lastName));

      todayAttendance = {
        attendanceId: existingAttendance.id,
        students,
      };
    }

    return {
      canTakeAttendance: true,
      currentSchedule: {
        day: todaySchedule.day,
        start: todaySchedule.startTime,
        end: todaySchedule.endTime,
        classroom: todaySchedule.classroom.name,
      },
      todayAttendance,
    };
  }

  async takeAttendance(
    groupId: string,
    updateDto: UpdateAttendanceDto,
    authenticatedUser: JwtPayload,
    ipAddress?: string,
  ): Promise<void> {
    const canTake = await this.checkCanTakeAttendance(
      groupId,
      authenticatedUser,
    );

    if (!canTake.canTakeAttendance) {
      throw new ForbiddenException(canTake.reason);
    }

    const teacherProfile = await this.teacherRepository.findByUserId(
      authenticatedUser.sub,
    );
    const group = await this.academicGroupRepository.findById(groupId);

    if (!teacherProfile || !group) {
      throw new NotFoundException('Profesor o grupo no encontrado.');
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let attendance = await this.attendanceRepository.findByGroupAndDate(
      groupId,
      today,
    );

    if (attendance) {
      attendance.studentStatuses = updateDto.studentStatuses;
      await this.attendanceRepository.save(attendance);
    } else {
      attendance = await this.attendanceRepository.create(
        teacherProfile,
        ipAddress!,
        LocationStatus.UNIVERSITY,
        group,
      );
      attendance.studentStatuses = updateDto.studentStatuses;
      attendance.classDate = new Date();
      await this.attendanceRepository.save(attendance);
    }
  }

  async getGroupAttendanceHistory(
    groupId: string,
    authenticatedUser: JwtPayload,
  ): Promise<GroupAttendanceRecord[]> {
    if (authenticatedUser.role !== 'teacher') {
      throw new ForbiddenException(
        'Solo los profesores pueden ver el historial de asistencias.',
      );
    }

    const teacherProfile = await this.teacherRepository.findByUserId(
      authenticatedUser.sub,
    );
    if (!teacherProfile) {
      throw new NotFoundException('Perfil de profesor no encontrado.');
    }

    const group = await this.academicGroupRepository.findById(groupId);

    console.log(group);
    console.log(teacherProfile);

    if (!group) {
      throw new NotFoundException('Grupo no encontrado.');
    }

    if (!group.teacher || group.teacher.id !== teacherProfile.id) {
      throw new ForbiddenException('No estás asignado a este grupo.');
    }

    const attendanceRecords = await this.attendanceRepository.findByGroupIds([
      groupId,
    ]);

    const allEnrollments = await this.enrollmentRepository.findAll();
    const relevantEnrollments = allEnrollments.filter(
      (enrollment) =>
        enrollment.course.id === group.academicCourse.id &&
        enrollment.groups.some((g) => g.id === groupId),
    );

    const history: GroupAttendanceRecord[] = attendanceRecords.map((record) => {
      const students: StudentAttendanceInfo[] = relevantEnrollments.map(
        (enrollment) => ({
          studentId: enrollment.student.id,
          cui: enrollment.student.cui,
          firstName: enrollment.student.name,
          lastName:
            `${enrollment.student.firstLastName} ${enrollment.student.secondLastName}`.trim(),
          status:
            record.studentStatuses[enrollment.student.id] ||
            AttendanceStatus.ABSENT,
        }),
      );

      students.sort((a, b) => a.lastName.localeCompare(b.lastName));

      return {
        attendanceId: record.id,
        classDate: record.classDate.toISOString(),
        students,
      };
    });

    history.sort(
      (a, b) =>
        new Date(b.classDate).getTime() - new Date(a.classDate).getTime(),
    );

    return history;
  }
}
