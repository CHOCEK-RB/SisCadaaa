import { IsArray, IsString } from 'class-validator';

export class UpdateTopicProgressDTO {
	@IsArray()
	@IsString({ each: true })
	completedTopics: string[];

	@IsString()
	groupName: string;
}
