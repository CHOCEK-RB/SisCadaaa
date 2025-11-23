import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { IAttendanceRepository } from '../../domain/repositories/iattendance.repository';
import { IEnrollmentRepository } from 'src/enrollment/domain/repositories/ienrollment.repository';
import { IStudentRepository } from 'src/users/domain/repositories/istudent.repository';
import { ITeacherRepository } from 'src/users/domain/repositories/iteacher.repository';
import { IAcademicGroupRepository } from 'src/groups/domain/repositories/iacademic_group.repository';
import { JwtPayload } from 'src/auth/domain/interfaces/jwt-payload.interface';
import { LocationStatus } from '../../domain/aggregates/attendance.entity';
import {
  Attendance,
  AttendanceStatus,
} from '../../domain/aggregates/attendance.entity';
import { DayOfWeek } from 'src/groups/domain/aggregates/schedule.entity';
import { StudentAttendanceInfoDTO } from '../dto/student-attendance-info.dto';
import { TakeAttendanceResponseDto } from '../dto/take-attendance-response.dto';
import { UpdateAttendanceRequestDto } from '../dto/update-attendance-request.dto';

/**
 * @class TakeAttendanceService
 * @description
 * Service responsible for managing the process of taking and updating student attendance.
 * It includes logic for checking if attendance can be taken based on user role, group schedule,
 * and current time, as well as methods for recording and updating attendance records.
 */
@Injectable()
export class TakeAttendanceService {
  /**
   * @constructor
   * @param {IAttendanceRepository} attendanceRepository - Repository for attendance data operations.
   * @param {IEnrollmentRepository} enrollmentRepository - Repository for enrollment data operations.
   * @param {IStudentRepository} studentRepository - Repository for student data operations.
   * @param {ITeacherRepository} teacherRepository - Repository for teacher data operations.
   * @param {IAcademicGroupRepository} academicGroupRepository - Repository for academic group data operations.
   */
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

  /**
   * @private
   * @method getDayOfWeek
   * @description
   * Determines the DayOfWeek enum value for a given Date object.
   * Excludes weekends as class scheduling is only for weekdays.
   * @param {Date} date - The date to convert to a DayOfWeek.
   * @returns {DayOfWeek} The corresponding DayOfWeek enum value.
   * @throws {BadRequestException} If the date falls on a weekend.
   */
  private getDayOfWeek(date: Date): DayOfWeek {
    const days = [
      DayOfWeek.MONDAY,
      DayOfWeek.TUESDAY,
      DayOfWeek.WEDNESDAY,
      DayOfWeek.THURSDAY,
      DayOfWeek.FRIDAY,
    ];
    const dayIndex = date.getDay();

    if (dayIndex === 0 || dayIndex === 6) {
      throw new BadRequestException('No hay clases los fines de semana.');
    }
    return days[dayIndex - 1];
  }

  /**
   * @private
   * @method isWithinSchedule
   * @description
   * Checks if the current time falls within a given schedule slot, allowing for a 15-minute buffer.
   * @param {Date} currentTime - The current time to check.
   * @param {string} scheduleStart - The start time of the schedule slot (e.g., "08:00").
   * @param {string} scheduleEnd - The end time of the schedule slot (e.g., "09:30").
   * @returns {boolean} True if the current time is within the schedule (plus buffer), false otherwise.
   */
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

    const buffer = 15;
    return now >= start - buffer && now <= end + buffer;
  }

  /**
   * @method checkCanTakeAttendance
   * @description
   * Determines if attendance can be taken for a specific group by the authenticated teacher.
   * It verifies the user's role, checks if the group exists and the teacher is assigned to it,
   * and validates if the current time falls within the group's scheduled class time for the day.
   * @param {string} groupId - The UUID of the academic group.
   * @param {JwtPayload} authenticatedUser - The authenticated teacher's JWT payload.
   * @returns {Promise<TakeAttendanceResponseDto>} A promise that resolves to a DTO indicating whether attendance can be taken and the reason if not.
   */
  async checkCanTakeAttendance(
    groupId: string,
    authenticatedUser: JwtPayload,
  ): Promise<TakeAttendanceResponseDto> {
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
          students: StudentAttendanceInfoDTO[];
        }
      | undefined = undefined;

    if (existingAttendance) {
      const allEnrollments = await this.enrollmentRepository.findAll();
      const relevantEnrollments = allEnrollments.filter(
        (enrollment) =>
          enrollment.course.id === group.academicCourse.id &&
          enrollment.groups.some((g) => g.id === groupId),
      );

      const students: StudentAttendanceInfoDTO[] = relevantEnrollments.map(
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

  /**
   * @method takeAttendance
   * @description
   * Records or updates attendance for a specific group.
   * First, it calls `checkCanTakeAttendance` to ensure attendance can legitimately be taken.
   * If an attendance record for today already exists for the group, it updates it; otherwise, it creates a new one.
   * @param {string} groupId - The UUID of the academic group for which to take attendance.
   * @param {UpdateAttendanceRequestDto} updateDto - DTO containing the student statuses for attendance.
   * @param {JwtPayload} authenticatedUser - The authenticated teacher's JWT payload.
   * @param {string} [ipAddress] - The IP address from which the attendance is being taken (optional, used for location tracking).
   * @returns {Promise<void>} A promise that resolves when the attendance record has been successfully saved or updated.
   * @throws {ForbiddenException} If attendance cannot be taken due to reasons determined by `checkCanTakeAttendance`.
   * @throws {NotFoundException} If the teacher or group is not found during the process.
   */
  async takeAttendance(
    groupId: string,
    updateDto: UpdateAttendanceRequestDto,
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
      attendance = new Attendance();
      attendance.teacher = teacherProfile;
      attendance.ipAddress = ipAddress!;
      attendance.location = LocationStatus.UNIVERSITY;
      attendance.academicGroup = group;
      attendance.classDate = new Date();
      attendance.studentStatuses = updateDto.studentStatuses;
      await this.attendanceRepository.add(attendance);
    }
  }
}
