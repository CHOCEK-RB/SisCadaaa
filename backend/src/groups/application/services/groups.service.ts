import {
  Injectable,
  Inject,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from "@nestjs/common";

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { IAcademicGroupRepository } from "../../domain/repositories/iacademic_group.repository";
import { IStudentRepository } from "src/users/domain/repositories/istudent.repository";
import { ITeacherRepository } from "src/users/domain/repositories/iteacher.repository";
import { IEnrollmentRepository } from "src/enrollment/domain/repositories/ienrollment.repository";
import { IAcademicCourseRepository } from "src/courses/domain/repositories/icourse_academic.repository"; // Corrected import
import { JwtPayload } from "src/auth/domain/interfaces/jwt-payload.interface";
import { AcademicGroupDTO } from "../dto/academic_group.dto";
import { CreateAcademicGroupDto } from "../dto/create-academic-group.dto"; // Added import
import { AcademicCourseDTO } from "src/courses/application/dto/academic_course.dto";
import {
  Enrollment,
  Grades,
} from "src/enrollment/domain/aggregates/enrollment.entity";
import { GroupType, AcademicGroup } from "../../domain/aggregates/academic_group.entity"; // Added AcademicGroup import
import { Teacher } from "src/users/domain/aggregates/teacher.entity"; // Added Teacher import
import { ScheduleSlotDTO } from "../dto/schedule.dto";
import { StudentInfoDTO } from "../dto/student-info.dto";
import { IClassroomRepository } from 'src/classroom/domain/repositories/iclassroom.repository';
import { IScheduleSlotRepository } from '../../domain/repositories/ischedule.repository';
import { ScheduleSlot, DayOfWeek } from '../../domain/aggregates/schedule.entity';
import { Classroom } from 'src/classroom/domain/aggregates/classroom.entity';
import { CreateScheduleDto } from '../dto/create-schedule.dto';
import { UpdateAcademicGroupDto } from '../dto/update-academic-group.dto';

import {
  GradeAttachment,
  GradeAttachmentType,
} from '../../domain/aggregates/grade_attachment.entity';
import {
  GRADE_ATTACHMENT_MAX_BYTES,
  GRADE_ATTACHMENT_PUBLIC_PATH,
} from '../constants/grade-attachments.constants';


export interface GroupsForPeriods {
  [period: string]: AcademicGroupDTO[];
}

export interface StudentGradeInfo {
  enrollmentId: string;
  studentId: string;
  cui: string;
  firstName: string;
  lastName: string;
  grades: Grades;
  highestGradePdfUrl?: string | null;
  lowestGradePdfUrl?: string | null;  
}

export interface GroupGradesResponse {
  groupId: string;
  groupName: string;
  groupType: GroupType;
  courseName: string;
  courseCode: string;
  canEdit: boolean;

  highestGradePdfUrl?: string | null;
  lowestGradePdfUrl?: string | null;

  students: StudentGradeInfo[];
  gradingScheme: {
    firstContinue: number;
    secondContinue: number;
    thirdContinue: number;
    firstPartial: number;
    secondPartial: number;
    thirdPartial: number;
  };
}

export interface UpdateGradeDto {
  enrollmentId: string;
  grades: Partial<Grades>;
}

@Injectable()
export class GroupsService {
  constructor(
    @Inject(IAcademicGroupRepository)
    private readonly academicGroupRepository: IAcademicGroupRepository,
    @Inject(IStudentRepository)
    private readonly studentRepository: IStudentRepository,
    @Inject(ITeacherRepository)
    private readonly teacherRepository: ITeacherRepository,
    @Inject(IEnrollmentRepository)
    private readonly enrollmentRepository: IEnrollmentRepository,
    @Inject(IAcademicCourseRepository) // Injected
    private readonly academicCourseRepository: IAcademicCourseRepository, // Injected
    @Inject(IClassroomRepository)
    private readonly classroomRepository: IClassroomRepository,
    @Inject(IScheduleSlotRepository)
    private readonly scheduleSlotRepository: IScheduleSlotRepository,
    @InjectRepository(GradeAttachment)
    private readonly gradeAttachmentRepository: Repository<GradeAttachment>,
  ) {}

  //support for grades attachments
  private validateGradeAttachment(file?: Express.Multer.File): void {
    if (!file) {
      throw new BadRequestException('PDF file is required.');
    }

    if (!file.mimetype.toLowerCase().includes('pdf')) {
      throw new BadRequestException('Only PDF files are allowed.');
    }

    if (file.size > GRADE_ATTACHMENT_MAX_BYTES) {
      throw new BadRequestException('PDF file exceeds the maximum size.');
    }
  }

  private getAttachmentUrl(filename: string): string {
    return `${GRADE_ATTACHMENT_PUBLIC_PATH}/${filename}`;
  }

  private ensureSyllabusAvailable(urlSyllabus?: string) {
    if (!urlSyllabus) {
      throw new ForbiddenException(
        'Syllabus must be uploaded before accessing this resource.',
      );
    }
  }

  async createAcademicGroup(
    createAcademicGroupDto: CreateAcademicGroupDto,
  ): Promise<AcademicGroupDTO> {
    const { academicCourseId, teacherId, name, capacity, type } =
      createAcademicGroupDto;

    const academicCourse = await this.academicCourseRepository.findById(
      academicCourseId,
    );
    if (!academicCourse) {
      throw new NotFoundException(
        `AcademicCourse with ID ${academicCourseId} not found.`,
      );
    }

    let teacher: Teacher | null = null;
    if (teacherId) {
      teacher = await this.teacherRepository.findById(teacherId);
      if (!teacher) {
        throw new NotFoundException(`Teacher with ID ${teacherId} not found.`);
      }
    }

    const newAcademicGroup = new AcademicGroup();
    newAcademicGroup.name = name;
    newAcademicGroup.capacity = capacity;
    newAcademicGroup.type = type;
    newAcademicGroup.academicCourse = academicCourse;
    newAcademicGroup.teacher = teacher;

    const savedGroup = await this.academicGroupRepository.save(newAcademicGroup);

    return {
      id: savedGroup.id,
      name: savedGroup.name,
      type: savedGroup.type,
      capacity: savedGroup.capacity,
      course: {
        id: academicCourse.id,
        course: {
          id: academicCourse.course.id,
          name: academicCourse.course.name,
          code: academicCourse.course.code,
        },
      },
      teacher: savedGroup.teacher
        ? {
            id: savedGroup.teacher.id,
            userId: savedGroup.teacher.user.id,
            email: savedGroup.teacher.user.email,
            firstName: savedGroup.teacher.name,
            lastName: `${savedGroup.teacher.firstLastName} ${savedGroup.teacher.secondLastName}`.trim(),
            role: "teacher",
          }
        : undefined,
    };
  }

  async createSchedule(createScheduleDto: CreateScheduleDto): Promise<void> {
    const { groupId, classroomId, scheduleSlots } = createScheduleDto;

    const academicGroup = await this.academicGroupRepository.findById(groupId);
    if (!academicGroup) {
      throw new NotFoundException(`AcademicGroup with ID ${groupId} not found.`);
    }

    const classroom = await this.classroomRepository.findById(classroomId);
    if (!classroom) {
      throw new NotFoundException(`Classroom with ID ${classroomId} not found.`);
    }

    const newScheduleSlots: ScheduleSlot[] = [];

    for (const slotDto of scheduleSlots) {
      const dayOfWeek = slotDto.day; // DayOfWeek enum value

      // 1. Check for conflicts with other schedules in the same classroom (Classroom Conflict Check)
      const existingClassroomSchedule =
        await this.scheduleSlotRepository.findConflictingSchedule(
          academicGroup.id, // Keep this parameter, but the implementation should ignore it for classroom-wide check
          classroom.id,
          dayOfWeek,
          slotDto.startTime,
          slotDto.endTime,
        );

      if (existingClassroomSchedule) {
        throw new BadRequestException(
          `Classroom conflict: Classroom ${classroom.name} is already occupied on ${dayOfWeek} from ${slotDto.startTime} to ${slotDto.endTime}.`,
        );
      }

      // 2. Check for conflicts within the academic group's own schedule (Academic Group Conflict Check)
      const existingGroupSchedule =
        await this.scheduleSlotRepository.findAcademicGroupConflict(
          academicGroup.id,
          dayOfWeek,
          slotDto.startTime,
          slotDto.endTime,
        );

      if (existingGroupSchedule) {
        throw new BadRequestException(
          `Group conflict: Academic Group ${academicGroup.name} already has a schedule on ${dayOfWeek} from ${slotDto.startTime} to ${slotDto.endTime}.`,
        );
      }

      const newScheduleSlot = new ScheduleSlot();
      newScheduleSlot.academicGroup = academicGroup;
      newScheduleSlot.classroom = classroom;
      newScheduleSlot.day = dayOfWeek;
      newScheduleSlot.startTime = slotDto.startTime;
      newScheduleSlot.endTime = slotDto.endTime;

      newScheduleSlots.push(newScheduleSlot);
    }

    await this.scheduleSlotRepository.save(newScheduleSlots);
  }

  async deleteScheduleSlot(scheduleSlotId: string, groupId: string): Promise<void> {
    const scheduleSlot = await this.scheduleSlotRepository.findByIdWithAcademicGroup(scheduleSlotId);

    if (!scheduleSlot) {
      throw new NotFoundException(`ScheduleSlot with ID ${scheduleSlotId} not found.`);
    }

    if (scheduleSlot.academicGroup.id !== groupId) {
      throw new ForbiddenException(`ScheduleSlot with ID ${scheduleSlotId} does not belong to AcademicGroup with ID ${groupId}.`);
    }

    await this.scheduleSlotRepository.delete(scheduleSlotId);
  }

  async updateAcademicGroup(
    groupId: string,
    updateAcademicGroupDto: UpdateAcademicGroupDto,
  ): Promise<AcademicGroupDTO> {
    const existingGroup = await this.academicGroupRepository.findById(groupId);
    if (!existingGroup) {
      throw new NotFoundException(`AcademicGroup with ID ${groupId} not found.`);
    }

    // Handle teacher update
    if (updateAcademicGroupDto.teacherId !== undefined) {
      if (updateAcademicGroupDto.teacherId === null) {
        // Explicitly setting teacher to null
        existingGroup.teacher = null;
      } else {
        const teacher = await this.teacherRepository.findById(
          updateAcademicGroupDto.teacherId,
        );
        if (!teacher) {
          throw new NotFoundException(
            `Teacher with ID ${updateAcademicGroupDto.teacherId} not found.`,
          );
        }
        existingGroup.teacher = teacher;
      }
    }

    // Update other properties
    if (updateAcademicGroupDto.name !== undefined) {
      existingGroup.name = updateAcademicGroupDto.name;
    }
    if (updateAcademicGroupDto.capacity !== undefined) {
      existingGroup.capacity = updateAcademicGroupDto.capacity;
    }
    if (updateAcademicGroupDto.type !== undefined) {
      existingGroup.type = updateAcademicGroupDto.type;
    }

    const updatedGroup = await this.academicGroupRepository.save(existingGroup);

    // Reconstruct AcademicGroupDTO
    return {
      id: updatedGroup.id,
      name: updatedGroup.name,
      type: updatedGroup.type,
      capacity: updatedGroup.capacity,
      course: {
        id: updatedGroup.academicCourse.id,
        course: {
          id: updatedGroup.academicCourse.course.id,
          name: updatedGroup.academicCourse.course.name,
          code: updatedGroup.academicCourse.course.code,
        },
      },
      teacher: updatedGroup.teacher
        ? {
            id: updatedGroup.teacher.id,
            userId: updatedGroup.teacher.user.id,
            email: updatedGroup.teacher.user.email,
            firstName: updatedGroup.teacher.name,
            lastName: `${updatedGroup.teacher.firstLastName} ${updatedGroup.teacher.secondLastName}`.trim(),
            role: "teacher",
          }
        : undefined,
    };
  }

  async getGroupDetails(id: string): Promise<AcademicGroupDTO> {
    const group = await this.academicGroupRepository.findGroupDetailsById(id);

    if (!group) {
      throw new NotFoundException(`Group with ID ${id} not found.`);
    }

    if (!group.academicCourse) {
      throw new InternalServerErrorException(
        `Academic Course not found for group with ID ${id}. Data inconsistency.`,
      );
    }

    if (!group.academicCourse.course) {
      throw new InternalServerErrorException(
        `Course details not found for academic course of group with ID ${id}. Data inconsistency.`,
      );
    }

    const courseDTO: AcademicCourseDTO = {
      id: group.academicCourse.id,
      creationDate: group.academicCourse.creationDate,
      urlSyllabus: group.academicCourse.urlSyllabus,
      course: {
        id: group.academicCourse.course.id,
        code: group.academicCourse.course.code,
        name: group.academicCourse.course.name,
        semester: group.academicCourse.course.semester,
        credits: group.academicCourse.course.credits,
      },
      grades: group.academicCourse.grades,
      coordinator: group.academicCourse.coordinator
        ? {
            id: group.academicCourse.coordinator.id,
            userId: group.academicCourse.coordinator.user.id,
            email: group.academicCourse.coordinator.user.email,
            firstName: group.academicCourse.coordinator.name,
            lastName:
              `${group.academicCourse.coordinator.firstLastName} ${group.academicCourse.coordinator.secondLastName}`.trim(),
            role: "teacher",
            isActive: group.academicCourse.coordinator.user.isActive,
          }
        : undefined,
      academicPeriod: group.academicCourse.academicPeriod,
      currentlyEnrolledLabGroupId: undefined,
      topics: group.academicCourse.topics.map((topic) => ({
        id: topic.id,
        order: topic.topicOrder,
        topic: topic.topic,
      })),
      progress:
        group.academicCourse.progress?.map((p) => ({
          id: p.id,
          groupName: p.groupName,
          completedTopics: p.completedTopics.map((ct) => ({
            id: ct.id,
            order: ct.topicOrder,
            topic: ct.topic,
          })),
        })) || [],
    };

    const groupDTO: AcademicGroupDTO = {
      id: group.id,
      name: group.name,
      type: group.type,
      capacity: group.capacity,
      course: courseDTO,
      teacher: group.teacher
        ? {
            id: group.teacher.id,
            userId: group.teacher.user.id,
            email: group.teacher.user.email,
            firstName: group.teacher.name,
            lastName:
              `${group.teacher.firstLastName} ${group.teacher.secondLastName}`.trim(),
            role: "teacher",
            isActive: group.teacher.user.isActive,
          }
        : undefined,
      enrollmentsCount: group.enrollments?.length ?? 0,
    };

    return groupDTO;
  }

  async getGroupGradesForSecretary(
    groupId: string,
  ): Promise<GroupGradesResponse> {
    const group =
      await this.academicGroupRepository.findGroupGradesById(groupId);

    if (!group) {
      throw new NotFoundException(`Group with ID ${groupId} not found.`);
    }

    if (!group.academicCourse) {
      throw new InternalServerErrorException(
        `Academic Course not found for group with ID ${groupId}. Data inconsistency.`,
      );
    }
    if (!group.academicCourse.course) {
      throw new InternalServerErrorException(
        `Course details not found for academic course of group with ID ${groupId}. Data inconsistency.`,
      );
    }

    const students: StudentGradeInfo[] =
      group.enrollments?.map((enrollment) => ({
        enrollmentId: enrollment.id,
        studentId: enrollment.student.id,
        cui: enrollment.student.cui,
        firstName: enrollment.student.name,
        lastName:
          `${enrollment.student.firstLastName} ${enrollment.student.secondLastName}`.trim(),
        grades: enrollment.grades || {
          firstContinue: -1,
          secondContinue: -1,
          thirdContinue: -1,
          firstPartial: -1,
          secondPartial: -1,
          thirdPartial: -1,
        },
      })) || [];

    students.sort((a, b) => a.lastName.localeCompare(b.lastName));

    return {
      groupId: group.id,
      groupName: group.name,
      groupType: group.type,
      courseName: group.academicCourse.course.name,
      courseCode: group.academicCourse.course.code,
      canEdit: false, // Secretary cannot edit grades
      students,
      gradingScheme: group.academicCourse.grades || {
        firstContinue: 0,
        secondContinue: 0,
        thirdContinue: 0,
        firstPartial: 0,
        secondPartial: 0,
        thirdPartial: 0,
      },
    };
  }

  private getAcademicPeriodLabel(date: Date): string {
    const year = date.getFullYear();
    const month = date.getUTCMonth();

    if (month >= 2 && month < 7) {
      return `${year}-A`;
    } else {
      return `${year}-B`;
    }
  }

  async getAllGroupsForTeacher(
    authenticatedUser: JwtPayload,
  ): Promise<GroupsForPeriods> {
    if (authenticatedUser.role !== "teacher") {
      throw new ForbiddenException("Only teachers can access this route");
    }

    const teacherId = await this.teacherRepository.getIdForUserId(
      authenticatedUser.sub,
    );

    if (!teacherId) {
      throw new ForbiddenException("Teacher not found");
    }

    const groups =
      await this.academicGroupRepository.findByIdTeacher(teacherId);

    if (!groups) {
      throw new ForbiddenException("Groups not found");
    }

    const groupsForPeriods: GroupsForPeriods = {};

    for (const group of groups) {
      const period = this.getAcademicPeriodLabel(
        group.academicCourse.creationDate,
      );

      if (!groupsForPeriods[period]) {
        groupsForPeriods[period] = [];
      }

      const groupDTO: AcademicGroupDTO = {
        id: group.id,
        name: group.name,
        type: group.type,
        course: {
          id: group.academicCourse.id,
          course: {
            id: group.academicCourse.course.id,
            code: group.academicCourse.course.code,
            name: group.academicCourse.course.name,
            semester: group.academicCourse.course.semester,
            credits: group.academicCourse.course.credits,
          },
        },
      };

      groupsForPeriods[period].push(groupDTO);
    }
    return groupsForPeriods;
  }

  async getAcademicCourse(id: string): Promise<AcademicCourseDTO> {
    const group = await this.academicGroupRepository.getAcademicCourse(id);

    console.log(id);
    console.log(group?.academicCourse);

    if (!group) {
      throw new ForbiddenException("Group not found");
    }

    const course: AcademicCourseDTO = {
      id: group.academicCourse.id,
      creationDate: group.academicCourse.creationDate,
      urlSyllabus: group.academicCourse.urlSyllabus,
      course: {
        id: group.academicCourse.course.id,
        code: group.academicCourse.course.code,
        name: group.academicCourse.course.name,
        semester: group.academicCourse.course.semester,
        credits: group.academicCourse.course.credits,
      },
      topics: group.academicCourse.topics.map((topic) => ({
        id: topic.id,
        order: topic.topicOrder,
        topic: topic.topic,
      })),
    };

    return course;
  }

  async getSchedule(id: string): Promise<AcademicGroupDTO[]> {
    const group = await this.academicGroupRepository.getScheduleById(id);

    if (!group) {
      throw new ForbiddenException("Group not found");
    }

    this.ensureSyllabusAvailable(group.academicCourse?.urlSyllabus);

    const groupDTO: AcademicGroupDTO = {
      id: group.id,
      name: group.name,
      type: group.type,
      schedule: group.schedule.map((s) => ({
        id: s.id,
        day: s.day,
        start: s.startTime,
        end: s.endTime,
        classroom: {
          id: s.classroom.id,
          name: s.classroom.name,
          type: s.classroom.type,
        },
      })),
    };

    const groups: AcademicGroupDTO[] = [];

    groups.push(groupDTO);

    return groups;
  }

  async getGroupsByCourse(courseId: string): Promise<AcademicGroupDTO[]> {
    const groups =
      await this.academicGroupRepository.findGroupsByCourseIdWithTeacherAndTopics(
        courseId,
      );

    if (!groups) {
      return [];
    }

    return groups.map((group) => {
      const groupDTO: AcademicGroupDTO = {
        id: group.id,
        name: group.name,
        type: group.type,
        capacity: group.capacity,
        teacher: group.teacher
          ? {
              id: group.teacher.id,
              userId: group.teacher.user.id,
              email: group.teacher.user.email,
              firstName: group.teacher.name,
              lastName:
                `${group.teacher.firstLastName} ${group.teacher.secondLastName}`.trim(),
              role: "teacher",
            }
          : undefined,
        topics: group.academicCourse.topics?.map((topic) => ({
          id: topic.id,
          order: topic.topicOrder,
          topic: topic.topic,
        })),
      };
      return groupDTO;
    });
  }

  async getGroupGrades(
    groupId: string,
    authenticatedUser: JwtPayload,
  ): Promise<GroupGradesResponse> {
    if (authenticatedUser.role !== "teacher") {
      throw new ForbiddenException("Only teachers can access group grades.");
    }

    const teacherProfile = await this.teacherRepository.findByUserId(
      authenticatedUser.sub,
    );
    if (!teacherProfile) {
      throw new NotFoundException("Teacher profile not found.");
    }

    console.log(teacherProfile);

    const group = await this.academicGroupRepository.findById(groupId);
    if (!group) {
      throw new NotFoundException(`Group with ID ${groupId} not found.`);
    }

    console.log(group);

    if (!group.teacher || group.teacher.id !== teacherProfile.id) {
      throw new ForbiddenException("You are not assigned to teach this group.");
    }

    this.ensureSyllabusAvailable(group.academicCourse?.urlSyllabus);

    const allEnrollments = group.enrollments;

    //load grade attachments
    const attachments = await this.gradeAttachmentRepository.find({
      where: { group: { id: groupId } },
    });

    const highestAttachment = attachments.find(
      (attachment) => attachment.type === GradeAttachmentType.HIGHEST,
    );
    const lowestAttachment = attachments.find(
      (attachment) => attachment.type === GradeAttachmentType.LOWEST,
    );

    const students: StudentGradeInfo[] = allEnrollments.map((enrollment) => ({
      enrollmentId: enrollment.id,
      studentId: enrollment.student.id,
      cui: enrollment.student.cui,
      firstName: enrollment.student.name,
      lastName:
        `${enrollment.student.firstLastName} ${enrollment.student.secondLastName}`.trim(),
      grades: enrollment.grades || {
        firstContinue: -1,
        secondContinue: -1,
        thirdContinue: -1,
        firstPartial: -1,
        secondPartial: -1,
        thirdPartial: -1,
      },
      highestGradePdfUrl: null,
      lowestGradePdfUrl: null,
    }));

    students.sort((a, b) => a.lastName.localeCompare(b.lastName));

    return {
      groupId: group.id,
      groupName: group.name,
      groupType: group.type,
      courseName: group.academicCourse.course.name,
      courseCode: group.academicCourse.course.code,
      canEdit: group.type === GroupType.THEORY,

      highestGradePdfUrl: highestAttachment?.url ?? null,
      lowestGradePdfUrl: lowestAttachment?.url ?? null,

      students,
      gradingScheme: group.academicCourse.grades || {
        firstContinue: 0,
        secondContinue: 0,
        thirdContinue: 0,
        firstPartial: 0,
        secondPartial: 0,
        thirdPartial: 0,
      },
    };
  }

  //grade attachments support
  async uploadGradePdf(
    groupId: string,
    type: GradeAttachmentType,
    file: Express.Multer.File,
    authenticatedUser: JwtPayload,
  ): Promise<{ url: string }> {
    if (authenticatedUser.role !== 'teacher') {
      throw new ForbiddenException('Only teachers can upload grade PDFs.');
    }

    const teacherProfile = await this.teacherRepository.findByUserId(
      authenticatedUser.sub,
    );
    if (!teacherProfile) {
      throw new NotFoundException('Teacher profile not found.');
    }

    const group = await this.academicGroupRepository.findById(groupId);
    if (!group) {
      throw new NotFoundException(`Group with ID ${groupId} not found.`);
    }

    if (!group.teacher || group.teacher.id !== teacherProfile.id) {
      throw new ForbiddenException('You are not assigned to teach this group.');
    }

    if (group.type !== GroupType.THEORY) {
      throw new BadRequestException(
        'Grade PDFs can only be uploaded for theory groups.',
      );
    }

    this.validateGradeAttachment(file);

    const url = this.getAttachmentUrl(file.filename);
    const existingAttachment = await this.gradeAttachmentRepository.findOne({
      where: { group: { id: groupId }, type },
    });

    const attachment =
      existingAttachment ??
      this.gradeAttachmentRepository.create({
        group,
        type,
      });

    attachment.url = url;
    attachment.uploadedAt = new Date();
    attachment.uploadedBy = teacherProfile;

    await this.gradeAttachmentRepository.save(attachment);

    return { url };
  }

  async updateStudentGrades(
    groupId: string,
    updateGradeDto: UpdateGradeDto,
    authenticatedUser: JwtPayload,
  ): Promise<void> {
    if (authenticatedUser.role !== "teacher") {
      throw new ForbiddenException("Only teachers can update grades.");
    }

    const teacherProfile = await this.teacherRepository.findByUserId(
      authenticatedUser.sub,
    );
    if (!teacherProfile) {
      throw new NotFoundException("Teacher profile not found.");
    }

    const group = await this.academicGroupRepository.findById(groupId);
    if (!group) {
      throw new NotFoundException(`Group with ID ${groupId} not found.`);
    }

    if (!group.teacher || group.teacher.id !== teacherProfile.id) {
      throw new ForbiddenException("You are not assigned to teach this group.");
    }

    this.ensureSyllabusAvailable(group.academicCourse?.urlSyllabus);

    if (group.type !== GroupType.THEORY) {
      throw new BadRequestException(
        "Grades can only be edited for theory groups.",
      );
    }

    const enrollment = await this.enrollmentRepository.findById(
      updateGradeDto.enrollmentId,
    );
    if (!enrollment) {
      throw new NotFoundException(
        `Enrollment with ID ${updateGradeDto.enrollmentId} not found.`,
      );
    }

    const validateGrade = (grade: number | null | undefined): boolean => {
      if (grade === undefined || grade === null) return true;
      return grade === -1 || (grade >= 0 && grade <= 20);
    };

    const grades = updateGradeDto.grades;
    if (
      !validateGrade(grades.firstContinue) ||
      !validateGrade(grades.secondContinue) ||
      !validateGrade(grades.thirdContinue) ||
      !validateGrade(grades.firstPartial) ||
      !validateGrade(grades.secondPartial) ||
      !validateGrade(grades.thirdPartial)
    ) {
      throw new BadRequestException(
        "Grades must be between 0 and 20, or -1 for not set.",
      );
    }

    enrollment.grades = {
      ...enrollment.grades,
      ...updateGradeDto.grades,
    };

    await this.enrollmentRepository.save(enrollment);
  }

  async updateMultipleGrades(
    groupId: string,
    updates: UpdateGradeDto[],
    authenticatedUser: JwtPayload,
  ): Promise<void> {
    if (authenticatedUser.role !== "teacher") {
      throw new ForbiddenException("Only teachers can update grades.");
    }

    const teacherProfile = await this.teacherRepository.findByUserId(
      authenticatedUser.sub,
    );
    if (!teacherProfile) {
      throw new NotFoundException("Teacher profile not found.");
    }

    const group = await this.academicGroupRepository.findById(groupId);
    if (!group) {
      throw new NotFoundException(`Group with ID ${groupId} not found.`);
    }

    if (!group.teacher || group.teacher.id !== teacherProfile.id) {
      throw new ForbiddenException("You are not assigned to teach this group.");
    }

    this.ensureSyllabusAvailable(group.academicCourse?.urlSyllabus);

    if (group.type !== GroupType.THEORY) {
      throw new BadRequestException(
        "Grades can only be edited for theory groups.",
      );
    }

    const enrollmentsToUpdate: Enrollment[] = [];

    for (const update of updates) {
      const enrollment: Enrollment | null =
        await this.enrollmentRepository.findById(update.enrollmentId);
      if (!enrollment) {
        console.warn(
          `Enrollment ${update.enrollmentId} not found, skipping...`,
        );
        continue;
      }

      enrollment.grades = {
        ...enrollment.grades,
        ...update.grades,
      };
      enrollmentsToUpdate.push(enrollment);
    }

    if (enrollmentsToUpdate.length > 0) {
      await this.enrollmentRepository.save(enrollmentsToUpdate);
    }
  }

  async getTeacherSchedule(
    authenticatedUser: JwtPayload,
  ): Promise<AcademicGroupDTO[]> {
    if (authenticatedUser.role !== "teacher") {
      throw new ForbiddenException("Only teachers can view their schedule.");
    }

    const teacherProfile = await this.teacherRepository.findByUserId(
      authenticatedUser.sub,
    );
    if (!teacherProfile) {
      throw new NotFoundException(
        `Teacher profile not found for user ID ${authenticatedUser.sub}.`,
      );
    }

    const allGroups =
      await this.academicGroupRepository.findWithScheduleByTeacherId(
        teacherProfile.id,
      );

    if (!allGroups || allGroups.length === 0) {
      return [];
    }

    const allPeriods = [
      ...new Set(
        allGroups.map((g) =>
          this.getAcademicPeriodLabel(g.academicCourse.creationDate),
        ),
      ),
    ].sort();

    if (allPeriods.length === 0) {
      return [];
    }

    const latestPeriod = allPeriods[allPeriods.length - 1];

    const groupsWithSchedule = allGroups.filter(
      (g) =>
        this.getAcademicPeriodLabel(g.academicCourse.creationDate) ===
        latestPeriod,
    );

    const groupsMap = new Map<string, AcademicGroupDTO>();

    for (const group of groupsWithSchedule) {
      if (!groupsMap.has(group.id)) {
        const schedules: ScheduleSlotDTO[] = group.schedule.map((schedule) => ({
          id: schedule.id,
          day: schedule.day,
          start: schedule.startTime,
          end: schedule.endTime,
          classroom: {
            id: schedule.classroom.id,
            name: schedule.classroom.name,
            type: schedule.classroom.type,
          },
        }));

        const groupDto: AcademicGroupDTO = {
          id: group.id,
          name: group.name,
          type: group.type,
          course: {
            id: group.academicCourse.id,
            course: {
              id: group.academicCourse.course.id,
              name: group.academicCourse.course.name,
              code: group.academicCourse.course.code,
            },
          },
          teacher: {
            id: teacherProfile.id,
            userId: authenticatedUser.sub,
            email: authenticatedUser.email,
            firstName: teacherProfile.name,
            lastName:
              `${teacherProfile.firstLastName} ${teacherProfile.secondLastName}`.trim(),
            role: "teacher",
          },
          schedule: schedules,
        };

        groupsMap.set(group.id, groupDto);
      }
    }

    return Array.from(groupsMap.values());
  }

  async getStudentsInGroup(groupId: string): Promise<StudentInfoDTO[]> {
    const group =
      await this.academicGroupRepository.findByIdWithEnrolledStudents(groupId);

    if (!group) {
      throw new NotFoundException(
        `Academic group with ID ${groupId} not found`,
      );
    }

    if (!group.enrollments || group.enrollments.length === 0) {
      return [];
    }

    const students: StudentInfoDTO[] = group.enrollments.map((enrollment) => ({
      id: enrollment.student.id,
      cui: enrollment.student.cui,
      firstName: enrollment.student.name,
      lastName:
        `${enrollment.student.firstLastName} ${enrollment.student.secondLastName}`.trim(),
      email: enrollment.student.user.email,
    }));

    // Sort by last name
    students.sort((a, b) => a.lastName.localeCompare(b.lastName));

    return students;
  }
  async getTeacherGroupsHistory(teacherId: string) {
    const teacher = await this.teacherRepository.findById(teacherId);
    if (!teacher) throw new NotFoundException("Docente no encontrado");

    const groups =
      (await this.academicGroupRepository.findAllByIdTeacher(teacherId)) ?? [];

    return groups
      .map((group) => {
        const academicCourse = group.academicCourse;
        if (!academicCourse || !academicCourse.course) return null;

        const date = new Date(academicCourse.creationDate);
        let year = date.getFullYear();
        const month = date.getMonth();

        let periodLetter = "B";
        if (month >= 1 && month <= 5) {
          periodLetter = "A";
        } else if (month === 0) {
          year -= 1;
          periodLetter = "B";
        } else {
          periodLetter = "B";
        }

        const academicPeriod = `${year}-${periodLetter}`;

        return {
          id: group.id,
          groupName: group.name,
          courseName: academicCourse.course.name,
          courseCode: academicCourse.course.code,
          semester: academicCourse.course.semester,
          academicPeriod,
          type: group.type,
          schedule: group.schedule,
          studentCount: group.enrollments?.length ?? 0,
        };
      })
      .filter((g) => g !== null);
  }
  async getScheduleForTeacherBySecretary(teacherId: string): Promise<any[]> {
    const groups =
      await this.academicGroupRepository.findScheduleByTeacherIdForSecretary(
        teacherId,
      );

    if (!groups || groups.length === 0) return [];

    const allPeriods = [
      ...new Set(
        groups.map((g) =>
          this.getAcademicPeriodLabel(g.academicCourse.creationDate),
        ),
      ),
    ].sort();
    const latestPeriod = allPeriods[allPeriods.length - 1];

    return groups
      .filter(
        (g) =>
          this.getAcademicPeriodLabel(g.academicCourse.creationDate) ===
          latestPeriod,
      )
      .map((group) => ({
        id: group.id,
        name: group.name,
        type: group.type,
        schedule: group.schedule.map((s) => ({
          id: s.id,
          day: s.day,
          start: s.startTime,
          end: s.endTime,
          classroom: { name: s.classroom?.name || "N/A" },
        })),
        course: {
          course: {
            name: group.academicCourse.course.name,
            code: group.academicCourse.course.code,
          },
        },
      }));
  }
}
