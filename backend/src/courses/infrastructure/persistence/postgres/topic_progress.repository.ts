import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { TopicProgress } from 'src/courses/domain/aggregates/topic_progress.entity';
import { ITopicProgressRepository } from 'src/courses/domain/repositories/itopic_progress.repository';

@Injectable()
export class TopicProgressRepository implements ITopicProgressRepository {
  constructor(
    @InjectRepository(TopicProgress)
    private readonly typeormRepo: Repository<TopicProgress>,
  ) {}

  save(progress: TopicProgress): Promise<TopicProgress>;
  save(progress: TopicProgress[]): Promise<TopicProgress[]>;
  async save(
    progressOrProgresses: TopicProgress | TopicProgress[],
  ): Promise<TopicProgress | TopicProgress[]> {
    if (Array.isArray(progressOrProgresses)) {
      return this.typeormRepo.save(progressOrProgresses);
    } else {
      return this.typeormRepo.save(progressOrProgresses);
    }
  }
}
