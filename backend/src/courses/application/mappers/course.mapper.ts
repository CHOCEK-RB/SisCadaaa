import { Injectable } from "@nestjs/common";
import { Course } from "../../domain/aggregates/course.entity";
import { CourseDTO } from "../dto/course.dto";

@Injectable()
export class CourseMapper {
  toDto(course: Course): CourseDTO {
    const courseDto: CourseDTO = {
      id: course.id,
      code: course.code,
      name: course.name,
      credits: course.credits,
      semester: course.semester,
    };
    return courseDto;
  }
}
