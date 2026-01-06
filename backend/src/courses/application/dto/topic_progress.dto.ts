import { CourseTopicDTO } from './course_topic.dto';

export class TopicProgressDTO {
  id: string;
  groupName: string;
  completedTopics: CourseTopicDTO[];
}
