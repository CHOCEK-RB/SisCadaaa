import { Injectable } from '@nestjs/common';
import { AcademicCourse } from '../../domain/aggregates/academic_course.entity';
import { AcademicCourseDTO } from '../dto/academic_course.dto';
import { CourseDTO } from '../dto/course.dto';
import { CourseTopicDTO } from '../dto/course_topic.dto';

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

    const detailDto: AcademicCourseDTO = {
      id: academicCourse.id,
      creationDate: academicCourse.creationDate,
      urlSyllabus: academicCourse.urlSyllabus,
      course: courseDto,
      topics: topicsDto,
      progress: progressDto,
    };

    return detailDto;
  }
}
