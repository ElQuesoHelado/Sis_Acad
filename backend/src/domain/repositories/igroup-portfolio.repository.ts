import { GroupPortfolio } from "../entities/group-portfolio.entity.js";
import { Id } from "../value-objects/index.js";

export interface IGroupPortfolioRepository {
  findByGroupId(groupId: Id): Promise<GroupPortfolio | null>;
  save(portfolio: GroupPortfolio): Promise<void>;
}
