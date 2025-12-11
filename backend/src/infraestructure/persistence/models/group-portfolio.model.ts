import { Entity, PrimaryColumn, Column, BaseEntity } from "typeorm";

@Entity("group_portfolios")
export class GroupPortfolioModel extends BaseEntity {
  @PrimaryColumn("uuid")
  id: string;

  @Column("uuid")
  groupId: string;

  @Column("varchar", { nullable: true })
  syllabusUrl: string;

  @Column("varchar", { nullable: true })
  lowGradeEvidenceUrl: string;

  @Column("varchar", { nullable: true })
  averageGradeEvidenceUrl: string;

  @Column("varchar", { nullable: true })
  highGradeEvidenceUrl: string;
}
