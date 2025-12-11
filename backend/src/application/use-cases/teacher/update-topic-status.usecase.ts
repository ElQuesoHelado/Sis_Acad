import { type ICourseContentRepository } from "@/domain/repositories/index.js";
import { Id } from "@/domain/value-objects/index.js";
import { TopicStatus } from "@/domain/enums/index.js";

export class UpdateTopicStatusUseCase {
  constructor(private readonly courseContentRepo: ICourseContentRepository) { }

  public async execute(topicId: string, status: TopicStatus): Promise<void> {
    const idVO = Id.create(topicId);

    const topic = await this.courseContentRepo.findById(idVO);
    if (!topic) {
      throw new Error(`Topic with ID ${topicId} not found.`);
    }

    if (status === TopicStatus.COMPLETED) {
      topic.markAsCompleted();
    } else {
      topic.markAsPending();
    }

    await this.courseContentRepo.save(topic);
  }
}
