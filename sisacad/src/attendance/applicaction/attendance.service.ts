import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { IAttendanceRepository } from '../infrastructure/iattendance.repository';
import { IEnrollmentRepository } from 'src/enrollment/infrastructure/ienrollment.repository';
import { IStudentRepository } from 'src/users/infrastructure/istudent.repository';
import { JwtPayload } from 'src/auth/interface/jwt-payload.interface';
import {
  GroupAttendanceDTO,
  StudentCourseAttendanceDTO,
} from './dto/attendance.dto';

import { AttendanceStatus } from '../aggregates/attendance.entity';

@Injectable()
export class AttendanceService {
  constructor(
    @Inject(IAttendanceRepository)
    private readonly attendanceRepository: IAttendanceRepository,
    @Inject(IEnrollmentRepository)
    private readonly enrollmentRepository: IEnrollmentRepository,
    @Inject(IStudentRepository)
    private readonly studentRepository: IStudentRepository,
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
}
