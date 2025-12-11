import { GroupPortfolio } from "@/domain/entities/group-portfolio.entity.js";
import { GroupPortfolioModel } from "../models/group-portfolio.model.js";
import { Id } from "@/domain/value-objects/index.js";
import { AppDataSource } from "../database.config.js";
import type { IGroupPortfolioRepository } from "@/domain/repositories/igroup-portfolio.repository.js";

export class TypeormGroupPortfolioRepository implements IGroupPortfolioRepository {
  private repo = AppDataSource.getRepository(GroupPortfolioModel);

  private toDomain(model: GroupPortfolioModel): GroupPortfolio {
    return GroupPortfolio.create({
      id: model.id,
      groupId: model.groupId,
      syllabusUrl: model.syllabusUrl,
      lowGradeEvidenceUrl: model.lowGradeEvidenceUrl,
      averageGradeEvidenceUrl: model.averageGradeEvidenceUrl,
      highGradeEvidenceUrl: model.highGradeEvidenceUrl,
    });
  }

  private toPersistence(entity: GroupPortfolio) {
    return {
      id: entity.id.value,
      groupId: entity.groupId.value,
      syllabusUrl: entity.syllabusUrl,
      lowGradeEvidenceUrl: entity.lowGradeEvidenceUrl,
      averageGradeEvidenceUrl: entity.averageGradeEvidenceUrl,
      highGradeEvidenceUrl: entity.highGradeEvidenceUrl,
    };
  }

  async findByGroupId(groupId: Id): Promise<GroupPortfolio | null> {
    const model = await this.repo.findOneBy({ groupId: groupId.value });
    return model ? this.toDomain(model) : null;
  }

  async save(portfolio: GroupPortfolio): Promise<void> {
    await this.repo.save(this.toPersistence(portfolio));
  }
}
