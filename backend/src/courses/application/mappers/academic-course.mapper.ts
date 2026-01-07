import { Injectable } from "@nestjs/common";
import { AcademicCourse } from "../../domain/aggregates/academic_course.entity";
import { AcademicCourseDTO } from "../dto/academic_course.dto";
import { AcademicGroupDTO } from "src/groups/application/dto/academic_group.dto";
import { CourseDTO } from "../dto/course.dto";
import { CourseTopicDTO } from "../dto/course_topic.dto";
import { TeacherProfileDTO } from "src/users/application/dto/teacher.dto";

@Injectable()
export class AcademicCourseMapper {
  toDto(academicCourse: AcademicCourse): AcademicCourseDTO {
    const courseDto: CourseDTO = {
      id: academicCourse.course.id,
      code: academicCourse.course.code,
      name: academicCourse.course.name,
      credits: academicCourse.course.credits,
      semester: academicCourse.course.semester,
    };

    const topicsDto: CourseTopicDTO[] | undefined = academicCourse.topics?.map(
      (topic) => ({
        id: topic.id,
        order: topic.topicOrder,
        topic: topic.topic,
      }),
    );

    const progressDto = academicCourse.progress?.map((p) => ({
      id: p.id,
      groupName: p.groupName,
      completedTopics:
        p.completedTopics?.map((ct) => ({
          id: ct.id,
          order: ct.topicOrder,
          topic: ct.topic,
        })) ?? [],
    }));

    const coordinatorDto: TeacherProfileDTO | undefined = (academicCourse.coordinator && academicCourse.coordinator.user)
      ? {
          id: academicCourse.coordinator.id,
          userId: academicCourse.coordinator.user.id,
          email: academicCourse.coordinator.user.email,
          firstName: academicCourse.coordinator.name,
          lastName: academicCourse.coordinator.firstLastName,
          role: "teacher",
          isActive: academicCourse.coordinator.user.isActive,
        }
      : undefined;

    const groupsDto: AcademicGroupDTO[] | undefined = academicCourse.groups?.map(
      (group) => ({
        id: group.id,
        name: group.name,
        type: group.type,
      }),
    );
    
    const detailDto: AcademicCourseDTO = {
      id: academicCourse.id,
      creationDate: academicCourse.creationDate,
      urlSyllabus: academicCourse.urlSyllabus,
      course: courseDto,
      topics: topicsDto,
      progress: progressDto,
      coordinator: coordinatorDto,
      academicPeriod: academicCourse.academicPeriod,
      groups: groupsDto,
    };

    return detailDto;
  }
}
