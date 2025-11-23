import { TopicProgress } from 'src/courses/domain/aggregates/topic_progress.entity';

export const ITopicProgressRepository = 'ITopicProgressRepository';

export interface ITopicProgressRepository {
  save(progress: TopicProgress[]): Promise<TopicProgress[]>;
  save(progress: TopicProgress): Promise<TopicProgress>;
}
