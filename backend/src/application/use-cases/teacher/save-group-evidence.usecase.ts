import { type IGroupPortfolioRepository } from "@/domain/repositories/igroup-portfolio.repository.js";
import { Id } from "@/domain/value-objects/index.js";
import { GroupPortfolio } from "@/domain/entities/group-portfolio.entity.js";
import { v4 as uuidv4 } from "uuid";

export class SaveGroupEvidenceUseCase {
  constructor(private readonly portfolioRepo: IGroupPortfolioRepository) {}

  public async execute(
    groupId: string,
    type: "low" | "avg" | "high" | "syllabus",
    fileUrl: string,
  ): Promise<void> {
    const groupIdVO = Id.create(groupId);
    
    let portfolio = await this.portfolioRepo.findByGroupId(groupIdVO);

    if (!portfolio) {
      portfolio = GroupPortfolio.create({
        id: uuidv4(),
        groupId: groupId,
      });
    }

    portfolio.updateEvidence(type, fileUrl);
    await this.portfolioRepo.save(portfolio);
  }
}
