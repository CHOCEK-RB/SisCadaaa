import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { IAttendanceRepository } from '../../domain/repositories/iattendance.repository';
import { IEnrollmentRepository } from 'src/enrollment/domain/repositories/ienrollment.repository';
import { IStudentRepository } from 'src/users/domain/repositories/istudent.repository';
import { ITeacherRepository } from 'src/users/domain/repositories/iteacher.repository';
import { IAcademicGroupRepository } from 'src/groups/domain/repositories/iacademic_group.repository';
import { JwtPayload } from 'src/auth/domain/interfaces/jwt-payload.interface';
import { StudentCourseAttendanceDTO } from '../dto/attendance.dto';
import { AttendanceStatus } from '../../domain/aggregates/attendance.entity';
import { StudentAttendanceInfoDTO } from '../dto/student-attendance-info.dto';
import { GroupAttendanceRecordResponseDto } from '../dto/group-attendance-record-response.dto';
import { StudentCourseAttendanceResponseDto } from '../dto/student-course-attendance-response.dto';

/**
 * @class AttendanceQueryService
 * @description
 * Service responsible for handling attendance-related queries. It provides methods for
 * retrieving a student's attendance for a specific course and for fetching the attendance history
 * for a particular academic group (primarily for teachers).
 */
@Injectable()
export class AttendanceQueryService {
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

     * @method getMyAttendanceForCourse

     * @description

     * Retrieves the attendance records for the authenticated student for a specific academic course.

     * This method is restricted to users with the 'student' role.

     * @param {string} academicCourseId - The UUID of the academic course.

     * @param {JwtPayload} authenticatedUser - The authenticated student's JWT payload.

     * @returns {Promise<StudentCourseAttendanceResponseDto>} A promise that resolves to a DTO containing the student's attendance grouped by academic group.

     * @throws {ForbiddenException} If the authenticated user is not a student.

     * @throws {NotFoundException} If the student profile, enrollment, or associated groups are not found.

     */

    async getMyAttendanceForCourse(

      academicCourseId: string,

      authenticatedUser: JwtPayload,

    ): Promise<StudentCourseAttendanceResponseDto> {

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

  

      const studentId = studentProfile.id;

  

      const enrollment = await this.enrollmentRepository.findByStudentAndCourse(

        studentId,

        academicCourseId,

      );

  

      if (!enrollment || !enrollment.groups || enrollment.groups.length === 0) {

        throw new NotFoundException(

          `Enrollment or associated groups not found for student ${studentId} in course ${academicCourseId}.`,

        );

      }

  

      const enrolledGroupIds = enrollment.groups.map((group) => group.id);

  

      const attendanceRecords =

        await this.attendanceRepository.findByGroupIds(enrolledGroupIds);

  

      const groupedAttendanceMap = new Map<

        string,

        StudentCourseAttendanceDTO[number]

      >();

  

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

  

      return result as StudentCourseAttendanceResponseDto;

    }

  

    /**

     * @method getGroupAttendanceHistory

     * @description

     * Retrieves the attendance history for a specific academic group.

     * This method is restricted to users with the 'teacher' role who are assigned to the group.

     * @param {string} groupId - The UUID of the academic group.

     * @param {JwtPayload} authenticatedUser - The authenticated teacher's JWT payload.

     * @returns {Promise<GroupAttendanceRecordResponseDto[]>} A promise that resolves to an array of DTOs containing attendance records for the group.

     * @throws {ForbiddenException} If the authenticated user is not a teacher or not assigned to the group.

     * @throws {NotFoundException} If the teacher profile or group is not found.

     */

    async getGroupAttendanceHistory(

      groupId: string,

      authenticatedUser: JwtPayload,

    ): Promise<GroupAttendanceRecordResponseDto[]> {

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

  

      const history: GroupAttendanceRecordResponseDto[] = attendanceRecords.map((record) => {

        const students: StudentAttendanceInfoDTO[] = relevantEnrollments.map(

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
