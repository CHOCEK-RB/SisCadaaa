import { Inject, Injectable, ForbiddenException } from '@nestjs/common';
import { ITopicProgressRepository } from 'src/courses/domain/repositories/itopic_progress.repository';
import { IAcademicCourseRepository } from 'src/courses/domain/repositories/icourse_academic.repository';
import { UpdateTopicProgressDTO } from '../dto/update-topic-progress.dto';
import { TopicProgress } from 'src/courses/domain/aggregates/topic_progress.entity';
import { ICourseTopicRepository } from 'src/courses/domain/repositories/icourse_topic.repository';

@Injectable()
export class TopicProgressService {
	constructor(
		@Inject(ITopicProgressRepository)
		private readonly topicProgressRepo: ITopicProgressRepository,
		@Inject(IAcademicCourseRepository)
		private readonly academicCourseRepo: IAcademicCourseRepository,
		@Inject(ICourseTopicRepository)
		private readonly courseTopicRepo: ICourseTopicRepository
	) {}

	async update(
		academicCourseId: string,
		updateTopicProgressDTO: UpdateTopicProgressDTO
	): Promise<TopicProgress> {
		const { groupName, completedTopics: completedTopicsIds } = updateTopicProgressDTO;

		const academicCourse = await this.academicCourseRepo.findById(academicCourseId);
		if (!academicCourse) {
			throw new Error('AcademicCourse not found');
		}

		if (!academicCourse.urlSyllabus) {
			throw new ForbiddenException('Syllabus is required before updating topics.');
		}

		let topicProgress = academicCourse.progress.find((p) => p.groupName === groupName);

		if (!topicProgress) {
			topicProgress = new TopicProgress();
			topicProgress.academicCourse = academicCourse;
			topicProgress.groupName = groupName;
		}

		const completedTopics = await Promise.all(
			completedTopicsIds.map((id) => this.courseTopicRepo.findById(id))
		);

		topicProgress.completedTopics = completedTopics.filter((t) => t !== null);

		return this.topicProgressRepo.save(topicProgress);
	}
}
