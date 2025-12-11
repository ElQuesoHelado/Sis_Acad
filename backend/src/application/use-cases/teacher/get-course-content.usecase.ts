import { type ICourseContentRepository, type ITheoryGroupRepository } from "@/domain/repositories/index.js";
import { Id } from "@/domain/value-objects/index.js";

export class GetCourseContentByGroupUseCase {
  constructor(
    private readonly courseContentRepo: ICourseContentRepository,
    private readonly theoryGroupRepo: ITheoryGroupRepository
  ) { }

  public async execute(groupId: string) {
    const idVO = Id.create(groupId);
    const group = await this.theoryGroupRepo.findById(idVO);
    if (!group) {
      throw new Error("Theory Group not found.");
    }

    const contents = await this.courseContentRepo.findByTheoryGroupId(idVO);

    return contents.map(c => ({
      id: c.id.value,
      week: c.week,
      topicName: c.topicName,
      status: c.status
    }));
  }
}
