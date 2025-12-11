import { Entity } from "./base/entity.base.js";
import { Id } from "../value-objects/index.js";

export interface GroupPortfolioProps {
  id: string;
  groupId: string;
  syllabusUrl?: string;
  lowGradeEvidenceUrl?: string;
  averageGradeEvidenceUrl?: string;
  highGradeEvidenceUrl?: string;
}

export class GroupPortfolio extends Entity {
  public readonly groupId: Id;
  public syllabusUrl?: string;
  public lowGradeEvidenceUrl?: string;
  public averageGradeEvidenceUrl?: string;
  public highGradeEvidenceUrl?: string;

  private constructor(props: GroupPortfolioProps) {
    super(Id.create(props.id));
    this.groupId = Id.create(props.groupId);
    this.syllabusUrl = props.syllabusUrl;
    this.lowGradeEvidenceUrl = props.lowGradeEvidenceUrl;
    this.averageGradeEvidenceUrl = props.averageGradeEvidenceUrl;
    this.highGradeEvidenceUrl = props.highGradeEvidenceUrl;
  }

  public static create(props: GroupPortfolioProps): GroupPortfolio {
    return new GroupPortfolio(props);
  }

  public updateEvidence(type: 'low' | 'avg' | 'high' | 'syllabus', url: string) {
    if (type === 'low') this.lowGradeEvidenceUrl = url;
    if (type === 'avg') this.averageGradeEvidenceUrl = url;
    if (type === 'high') this.highGradeEvidenceUrl = url;
    if (type === 'syllabus') this.syllabusUrl = url;
  }
}
