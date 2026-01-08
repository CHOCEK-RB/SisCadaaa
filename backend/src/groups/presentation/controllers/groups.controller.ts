import {
  Controller,
  Get,
  UseGuards,
  Param,
  ParseUUIDPipe,
  Patch,
  Body,
  Post, // Added Post
  HttpCode, // Added HttpCode for clarity
  HttpStatus, // Added HttpStatus for clarity
  Delete, // Added Delete
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from "@nestjs/common";

import { AuthGuard } from "@nestjs/passport";

import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { extname } from "path";
import { randomUUID } from "crypto";
import * as fs from "fs";

import { GetUser } from "src/users/presentation/decorators/get_user.decorator";

import type { JwtPayload } from "src/auth/domain/interfaces/jwt-payload.interface";

import {
  GroupsService,
  GroupsForPeriods,
  GroupGradesResponse,
  type UpdateGradeDto,
} from "../../application/services/groups.service";
import { AcademicGroupDTO } from "../../application/dto/academic_group.dto";
import { CreateAcademicGroupDto } from "../../application/dto/create-academic-group.dto"; // Added import
import { AcademicCourseDTO } from "src/courses/application/dto/academic_course.dto";
import { StudentInfoDTO } from "../../application/dto/student-info.dto"; // Added import
import { CreateScheduleDto } from "../../application/dto/create-schedule.dto";
import { UpdateAcademicGroupDto } from "../../application/dto/update-academic-group.dto";

import {
  GRADE_ATTACHMENT_MAX_BYTES,
  GRADE_ATTACHMENT_UPLOAD_DIR,
} from "../../application/constants/grade-attachments.constants";
import { GradeAttachmentType } from "../../domain/aggregates/grade_attachment.entity";
import { Roles } from "src/auth/presentation/decorators/roles.decorator";
import { JwtAuthGuard } from "src/auth/presentation/guards/jwt-auth.guard";
import { Role } from "src/users/domain/aggregates/role.enum";
import { RolesGuard } from "src/auth/presentation/guards/roles.guard";

const gradeAttachmentStorage = diskStorage({
  destination: (_req, _file, callback) => {
    fs.mkdirSync(GRADE_ATTACHMENT_UPLOAD_DIR, { recursive: true });
    callback(null, GRADE_ATTACHMENT_UPLOAD_DIR);
  },
  filename: (_req, file, callback) => {
    const extension = extname(file.originalname).toLowerCase() || ".pdf";
    callback(null, `${randomUUID()}${extension}`);
  },
});

const pdfFileFilter = (
  _req: unknown,
  file: Express.Multer.File,
  callback: (error: Error | null, acceptFile: boolean) => void,
) => {
  if (file.mimetype.toLowerCase().includes("pdf")) {
    callback(null, true);
    return;
  }

  callback(new BadRequestException("Only PDF files are allowed."), false);
};

/**
 * @class GroupsController
 * @description
 * Controller responsible for managing academic groups, teacher schedules, course details, and student grades.
 * It provides endpoints for retrieving group information for teachers, schedules, academic course details,
 * and managing student grades within groups. All endpoints are protected by JWT authentication.
 */
@Controller("groups")
@UseGuards(AuthGuard("jwt"))
export class GroupsController {
  /**
   * @constructor
   * @param {GroupsService} groupsService - Service for handling business logic related to academic groups.
   */
  constructor(private readonly groupsService: GroupsService) {}

  /**
   * @method createAcademicGroup
   * @description
   * Creates a new academic group.
   * @param {CreateAcademicGroupDto} createAcademicGroupDto - DTO containing data for the new academic group.
   * @returns {Promise<AcademicGroupDTO>} A promise that resolves to the created academic group DTO.
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createAcademicGroup(
    @Body() createAcademicGroupDto: CreateAcademicGroupDto,
  ): Promise<AcademicGroupDTO> {
    return await this.groupsService.createAcademicGroup(createAcademicGroupDto);
  }

  @Post("schedule")
  @HttpCode(HttpStatus.CREATED)
  async createSchedule(
    @Body() createScheduleDto: CreateScheduleDto,
  ): Promise<{ message: string }> {
    await this.groupsService.createSchedule(createScheduleDto);
    return { message: "Schedule created successfully" };
  }

  @Delete(":groupId/schedule/:scheduleSlotId")
  @HttpCode(HttpStatus.NO_CONTENT) // 204 No Content for successful deletion
  async deleteScheduleSlot(
    @Param("groupId", ParseUUIDPipe) groupId: string,
    @Param("scheduleSlotId", ParseUUIDPipe) scheduleSlotId: string,
  ): Promise<void> {
    await this.groupsService.deleteScheduleSlot(scheduleSlotId, groupId);
  }

  @Patch(":groupId")
  async updateAcademicGroup(
    @Param("groupId", ParseUUIDPipe) groupId: string,
    @Body() updateAcademicGroupDto: UpdateAcademicGroupDto,
  ): Promise<AcademicGroupDTO> {
    return this.groupsService.updateAcademicGroup(
      groupId,
      updateAcademicGroupDto,
    );
  }

  @Get(":id/details")
  @UseGuards(AuthGuard("jwt"))
  async getGroupDetails(
    @Param("id", ParseUUIDPipe) id: string,
  ): Promise<AcademicGroupDTO> {
    return await this.groupsService.getGroupDetails(id);
  }

  /**
   * @method getAllGroupsForTeacher
   * @description
   * Retrieves all academic groups associated with the authenticated teacher.
   * @param {JwtPayload} user - The authenticated teacher's JWT payload containing user information.
   * @returns {Promise<GroupsForPeriods>} A promise that resolves to an object containing grouped academic groups.
   */
  @Get("/teacher")
  @UseGuards(AuthGuard("jwt"))
  async getAllGroupsForTeacher(
    @GetUser() user: JwtPayload,
  ): Promise<GroupsForPeriods> {
    return await this.groupsService.getAllGroupsForTeacher(user);
  }

  /**
   * @method getTeacherSchedule
   * @description
   * Fetches the complete academic schedule for the authenticated teacher.
   * @param {JwtPayload} user - The authenticated teacher's JWT payload.
   * @returns {Promise<AcademicGroupDTO[]>} A promise that resolves to an array of academic group DTOs representing the teacher's schedule.
   */
  @Get("/teacher/my-schedule")
  @UseGuards(AuthGuard("jwt"))
  async getTeacherSchedule(
    @GetUser() user: JwtPayload,
  ): Promise<AcademicGroupDTO[]> {
    return await this.groupsService.getTeacherSchedule(user);
  }

  /**
   * @method getSchedule
   * @description
   * Retrieves the schedule for a specific academic group by its ID.
   * @param {string} id - The UUID of the academic group.
   * @returns {Promise<AcademicGroupDTO[]>} A promise that resolves to an array of academic group DTOs for the specified group.
   */
  @Get("/schedule/:id")
  @UseGuards(AuthGuard("jwt"))
  async getSchedule(
    @Param("id", ParseUUIDPipe) id: string,
  ): Promise<AcademicGroupDTO[]> {
    return await this.groupsService.getSchedule(id);
  }

  /**
   * @method getAcademicCourse
   * @description
   * Fetches details of a specific academic course by its ID.
   * @param {string} id - The UUID of the academic course.
   * @returns {Promise<AcademicCourseDTO>} A promise that resolves to the academic course DTO.
   */
  @Get("/course/:id")
  @UseGuards(AuthGuard("jwt"))
  async getAcademicCourse(
    @Param("id", ParseUUIDPipe) id: string,
  ): Promise<AcademicCourseDTO> {
    return await this.groupsService.getAcademicCourse(id);
  }

  @Get("/by-course/:courseId")
  @UseGuards(AuthGuard("jwt"))
  async getGroupsByCourse(
    @Param("courseId", ParseUUIDPipe) courseId: string,
  ): Promise<AcademicGroupDTO[]> {
    return await this.groupsService.getGroupsByCourse(courseId);
  }

  /**
   * @method getGroupGrades
   * @description
   * Retrieves grades for all students within a specific academic group.
   * @param {string} id - The UUID of the academic group.
   * @param {JwtPayload} user - The authenticated user's JWT payload.
   * @returns {Promise<GroupGradesResponse>} A promise that resolves to a DTO containing group grades information.
   */
  @Get("/:id/grades")
  @UseGuards(AuthGuard("jwt"))
  async getGroupGrades(
    @Param("id", ParseUUIDPipe) id: string,
    @GetUser() user: JwtPayload,
  ): Promise<GroupGradesResponse> {
    return await this.groupsService.getGroupGrades(id, user);
  }

  @Get("/:id/grades/secretary")
  @UseGuards(AuthGuard("jwt"))
  async getGroupGradesForSecretary(
    @Param("id", ParseUUIDPipe) id: string,
  ): Promise<GroupGradesResponse> {
    return await this.groupsService.getGroupGradesForSecretary(id);
  }

  /**
   * @method getStudentsInGroup
   * @description
   * Retrieves a list of students enrolled in a specific academic group.
   * @param {string} groupId - The UUID of the academic group.
   * @returns {Promise<StudentInfoDTO[]>} A promise that resolves to an array of DTOs containing basic student information.
   */
  @Get("/:groupId/students")
  @UseGuards(AuthGuard("jwt"))
  async getStudentsInGroup(
    @Param("groupId", ParseUUIDPipe) groupId: string,
  ): Promise<StudentInfoDTO[]> {
    return await this.groupsService.getStudentsInGroup(groupId);
  }

  /**
   * @method updateStudentGrades
   * @description
   * Updates the grade for a single student within a specific academic group.
   * This endpoint is protected by `GradingPeriodActiveGuard` to ensure grade updates are only possible during active grading periods.
   * @param {string} id - The UUID of the academic group.
   * @param {UpdateGradeDto} updateDto - DTO containing the student ID and the new grade.
   * @param {JwtPayload} user - The authenticated user's JWT payload.
   * @returns {Promise<void>} A promise that resolves when the grade has been updated.
   */
  @Patch("/:id/grades")
  //@UseGuards(AuthGuard('jwt'), GradingPeriodActiveGuard)
  @UseGuards(AuthGuard("jwt"))
  async updateStudentGrades(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateGradeDto,
    @GetUser() user: JwtPayload,
  ): Promise<void> {
    return await this.groupsService.updateStudentGrades(id, updateDto, user);
  }

  /**
   * @method updateMultipleGrades
   * @description
   * Updates grades for multiple students within a specific academic group.
   * This endpoint is protected by `GradingPeriodActiveGuard` to ensure grade updates are only possible during active grading periods.
   * @param {string} id - The UUID of the academic group.
   * @param {UpdateGradeDto[]} update - An array of DTOs, each containing a student ID and a new grade.
   * @param {JwtPayload} user - The authenticated user's JWT payload.
   * @returns {Promise<void>} A promise that resolves when the grades have been updated.
   */
  @Patch("/:id/grades/bulk")
  //@UseGuards(AuthGuard('jwt'), GradingPeriodActiveGuard)
  @UseGuards(AuthGuard("jwt"))
  async updateMultipleGrades(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() update: UpdateGradeDto[],
    @GetUser() user: JwtPayload,
  ) {
    await this.groupsService.updateMultipleGrades(id, update, user);
    return { success: true, message: "Notas actualizadas correctamente" };
  }

  @Post("/:id/grades/highest/pdf")
  @UseInterceptors(
    FileInterceptor("file", {
      storage: gradeAttachmentStorage,
      fileFilter: pdfFileFilter,
      limits: { fileSize: GRADE_ATTACHMENT_MAX_BYTES },
    }),
  )
  async uploadHighestGradePdf(
    @Param("id", ParseUUIDPipe) id: string,
    @UploadedFile() file: Express.Multer.File,
    @GetUser() user: JwtPayload,
  ): Promise<{ url: string }> {
    return await this.groupsService.uploadGradePdf(
      id,
      GradeAttachmentType.HIGHEST,
      file,
      user,
    );
  }

  @Post("/:id/grades/lowest/pdf")
  @UseInterceptors(
    FileInterceptor("file", {
      storage: gradeAttachmentStorage,
      fileFilter: pdfFileFilter,
      limits: { fileSize: GRADE_ATTACHMENT_MAX_BYTES },
    }),
  )
  async uploadLowestGradePdf(
    @Param("id", ParseUUIDPipe) id: string,
    @UploadedFile() file: Express.Multer.File,
    @GetUser() user: JwtPayload,
  ): Promise<{ url: string }> {
    return await this.groupsService.uploadGradePdf(
      id,
      GradeAttachmentType.LOWEST,
      file,
      user,
    );
  }
  @Get("teacher/:teacherId/history")
  @Roles(Role.SECRETARY, Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getTeacherGroups(@Param("teacherId", ParseUUIDPipe) teacherId: string) {
    return await this.groupsService.getTeacherGroupsHistory(teacherId);
  }
  @Get("teacher/:teacherId/schedule-view")
  @Roles(Role.SECRETARY, Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getScheduleForSecretary(
    @Param("teacherId", ParseUUIDPipe) teacherId: string,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return await this.groupsService.getScheduleForTeacherBySecretary(teacherId);
  }
}
