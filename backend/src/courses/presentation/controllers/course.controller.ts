import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { CourseService } from "../../application/services/course.service"; // This service will be created
import { CourseDTO } from "../../application/dto/course.dto"; // Assuming this DTO exists

@Controller("courses")
@UseGuards(AuthGuard("jwt"))
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  @Get("search")
  async searchCourses(@Query("q") query: string): Promise<CourseDTO[]> {
    return this.courseService.searchCourses(query);
  }
}
