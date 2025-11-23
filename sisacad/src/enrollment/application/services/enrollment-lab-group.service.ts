import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { JwtPayload } from 'src/auth/domain/interfaces/jwt-payload.interface';
import { IEnrollmentRepository } from '../../domain/repositories/ienrollment.repository';
import { IStudentRepository } from 'src/users/domain/repositories/istudent.repository';
import { IAcademicGroupRepository } from 'src/groups/domain/repositories/iacademic_group.repository';
import { Enrollment } from '../../domain/aggregates/enrollment.entity';
import { GroupType } from 'src/groups/domain/aggregates/academic_group.entity';
import { EnrollLabGroupDto } from '../dto/enrollment.dto';
import { AcademicCourseDTO } from 'src/courses/application/dto/academic_course.dto';
import { ScheduleSlotDTO } from 'src/groups/application/dto/schedule.dto';
import { AcademicGroupDTO } from 'src/groups/application/dto/academic_group.dto';

@Injectable()
export class EnrollmentLabGroupService {
  constructor(
    @Inject(IEnrollmentRepository)
    private readonly enrollmentRepository: IEnrollmentRepository,
    @Inject(IStudentRepository)
    private readonly studentRepository: IStudentRepository,
    @Inject(IAcademicGroupRepository)
    private readonly academicGroupRepository: IAcademicGroupRepository,
  ) {}

  async getAvaLabGroupsForUser(
    authenticatedUser: JwtPayload,
  ): Promise<AcademicCourseDTO[]> {
    if (authenticatedUser.role !== 'student') {
      throw new ForbiddenException(
        'Solo los estudiantes pueden ver esta información.',
      );
    }
    const studentProfile = await this.studentRepository.findByUserId(
      authenticatedUser.sub,
    );
    if (!studentProfile) {
      throw new NotFoundException(`Perfil de estudiante no encontrado.`);
    }

    const enrollments =
      await this.enrollmentRepository.findByStudentIdAndActives(
        studentProfile.id,
      );
    if (!enrollments || enrollments.length === 0) {
      return [];
    }

    const labSelectionsMap = new Map<string, string>();
    for (const enr of enrollments) {
      const currentLabGroup = enr.groups.find(
        (g) => g.type === GroupType.LABORATORY,
      );
      if (currentLabGroup) {
        labSelectionsMap.set(enr.course.id, currentLabGroup.id);
      }
    }

    const academicCourseIds = enrollments.map((enr) => enr.course.id);

    const allLabGroups =
      await this.academicGroupRepository.findAllByCoursesAndType(
        academicCourseIds,
        GroupType.LABORATORY,
      );

    if (!allLabGroups || allLabGroups.length === 0) {
      return [];
    }

    const coursesMap = new Map<string, AcademicCourseDTO>();

    for (const group of allLabGroups) {
      const courseId = group.academicCourse.id;
      const currentlyEnrolledLabGroupId =
        labSelectionsMap.get(courseId) || null;

      const isCurrentSelection = group.id === currentlyEnrolledLabGroupId;
      const hasCapacity = group.enrollments.length < group.capacity;

      if (hasCapacity || isCurrentSelection) {
        if (!coursesMap.has(courseId)) {
          coursesMap.set(courseId, {
            id: courseId,
            course: {
              id: group.academicCourse.course.id,
              name: group.academicCourse.course.name,
              code: group.academicCourse.course.code,
            },
            groups: [],
            currentlyEnrolledLabGroupId: currentlyEnrolledLabGroupId,
          });
        }

        const schedule: ScheduleSlotDTO[] = group.schedule.map((s) => ({
          id: s.id,
          day: s.day,
          start: s.startTime,
          end: s.endTime,
          classroom: {
            id: s.classroom.id,
            name: s.classroom.name,
            type: s.classroom.type,
          },
        }));

        const groupDto: AcademicGroupDTO = {
          id: group.id,
          name: group.name,
          type: group.type,
          schedule: schedule,
          capacity: group.capacity,
          enrollmentsCount: group.enrollments.length,
        };

        coursesMap.get(courseId)!.groups!.push(groupDto);
      }
    }

    const availableCourses = Array.from(coursesMap.values()).filter(
      (course) => course.groups && course.groups.length > 0,
    );

    return availableCourses;
  }

  async enrollInLabGroups(
    dto: EnrollLabGroupDto,
    authenticatedUser: JwtPayload,
  ): Promise<void> {
    console.log('EnrollLabGroupDto', dto);

    if (authenticatedUser.role !== 'student') {
      throw new ForbiddenException('Solo los estudiantes pueden matricularse.');
    }

    const studentProfile = await this.studentRepository.findByUserId(
      authenticatedUser.sub,
    );
    if (!studentProfile) {
      throw new NotFoundException(`Perfil de estudiante no encontrado.`);
    }

    const labGroupIds = dto.labGroupIds;
    if (!labGroupIds || labGroupIds.length === 0) {
      throw new BadRequestException('No se seleccionó ningún grupo.');
    }

    const updatedEnrollments: Enrollment[] = [];

    const newGroups = await this.academicGroupRepository.findByGroupIds(
      labGroupIds,
      GroupType.LABORATORY,
    );

    console.log('newGroups', newGroups, labGroupIds);

    if (newGroups!.length !== labGroupIds.length) {
      throw new NotFoundException('Uno o más grupos seleccionados no existen.');
    }

    const enrollments =
      await this.enrollmentRepository.findByStudentIdAndActives(
        studentProfile.id,
      );
    if (!enrollments || enrollments.length === 0) {
      throw new NotFoundException(
        `Matrícula no encontrada para el estudiante ${studentProfile.id}.`,
      );
    }

    for (const newGroup of newGroups!) {
      console.log(newGroup);
      if (newGroup.enrollments.length >= newGroup.capacity) {
        const studentAlreadyInGroup = newGroup.enrollments.some(
          (enr) => enr.student?.id === studentProfile.id,
        );
        if (!studentAlreadyInGroup) {
          throw new BadRequestException(
            `El grupo ${newGroup.name} del curso ${newGroup.academicCourse.course.name} está lleno.`,
          );
        }
      }

      const enrollment = enrollments.find(
        (enr) => enr.course.id === newGroup.academicCourse.id,
      );

      if (!enrollment) {
        throw new NotFoundException(
          `Matrícula no encontrada para el curso ${newGroup.academicCourse.course.name}.`,
        );
      }

      enrollment.groups = enrollment.groups.filter(
        (g) => g.type !== GroupType.LABORATORY,
      );

      enrollment.groups.push(newGroup);
      updatedEnrollments.push(enrollment);
    }

    if (updatedEnrollments.length === 0) {
      // This case should ideally not be reached if labGroupIds is not empty
      // and all selected groups are valid. But as a safeguard:
      throw new BadRequestException(
        'No se pudo actualizar ninguna matrícula. Verifique los grupos seleccionados.',
      );
    }

    await this.enrollmentRepository.save(updatedEnrollments);
  }
}
