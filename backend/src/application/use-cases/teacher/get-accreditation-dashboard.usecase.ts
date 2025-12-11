import type {
  IEnrollmentRepository,
  IGradeRepository,
  IGradeWeightRepository,
  IGroupPortfolioRepository
} from "@/domain/repositories/index.js";
import { Id } from "@/domain/value-objects/index.js";
import type { AccreditationDashboardDto } from "@/application/dtos/accreditation.dto.js";
import { GroupPortfolio } from "@/domain/entities/group-portfolio.entity.js";
import { v4 as uuidv4 } from "uuid";
import type { GradeType } from "@/domain/enums/grade-type.enum.js";

export class GetAccreditationDashboardUseCase {
  constructor(
    private readonly enrollmentRepo: IEnrollmentRepository,
    private readonly gradeRepo: IGradeRepository,
    private readonly portfolioRepo: IGroupPortfolioRepository,
    private readonly gradeWeightRepo: IGradeWeightRepository
  ) { }

  public async execute(groupId: string): Promise<AccreditationDashboardDto> {
    const groupIdVO = Id.create(groupId);

    const enrollments = await this.enrollmentRepo.findByGroupId(groupIdVO);

    const weights = await this.gradeWeightRepo.findByTheoryGroupId(groupIdVO);
    const weightMap = new Map<GradeType, number>();
    weights.forEach(w => weightMap.set(w.type, w.weight.value / 100));

    let minFinal = 20;
    let maxFinal = 0;
    let totalFinalSum = 0;
    let studentCount = 0;

    const evaluationMap = new Map<string, { failed: number; regular: number; good: number; excellent: number }>();

    for (const enrollment of enrollments) {
      const grades = await this.gradeRepo.findByEnrollmentId(enrollment.id);

      if (grades.length === 0) continue;

      let studentFinalGrade = 0;

      for (const grade of grades) {
        const weight = weightMap.get(grade.type) || 0;

        studentFinalGrade += grade.score.value * weight;


        const type = grade.type;
        if (!evaluationMap.has(type)) {
          evaluationMap.set(type, { failed: 0, regular: 0, good: 0, excellent: 0 });
        }
        const buckets = evaluationMap.get(type)!;
        if (grade.score.value < 10.5) buckets.failed++;
        else if (grade.score.value < 13.5) buckets.regular++;
        else if (grade.score.value < 16.5) buckets.good++;
        else buckets.excellent++;
      }

      studentFinalGrade = Math.round(studentFinalGrade * 100) / 100;

      if (studentFinalGrade < minFinal) minFinal = studentFinalGrade;
      if (studentFinalGrade > maxFinal) maxFinal = studentFinalGrade;
      totalFinalSum += studentFinalGrade;
      studentCount++;
    }

    const classAverage = studentCount > 0 ? parseFloat((totalFinalSum / studentCount).toFixed(2)) : 0;

    const evaluations = Array.from(evaluationMap.entries()).map(([name, buckets]) => ({
      name: name.replace(/_/g, ' '),
      distribution: [
        { label: 'En Riesgo (0-10)', count: buckets.failed, color: '#ef4444' },
        { label: 'Regular (11-13)', count: buckets.regular, color: '#eab308' },
        { label: 'Bueno (14-16)', count: buckets.good, color: '#3b82f6' },
        { label: 'Excelente (17-20)', count: buckets.excellent, color: '#22c55e' }
      ]
    }));

    evaluations.sort((a, b) => a.name.localeCompare(b.name));

    let portfolio = await this.portfolioRepo.findByGroupId(groupIdVO);
    if (!portfolio) {
      portfolio = GroupPortfolio.create({ id: uuidv4(), groupId });
    }

    return {
      stats: {
        lowestAverage: studentCount > 0 ? minFinal : 0,
        highestAverage: studentCount > 0 ? maxFinal : 0,
        classAverage,
        studentCount
      },
      evaluations,
      evidence: {
        syllabusUrl: portfolio.syllabusUrl,
        lowUrl: portfolio.lowGradeEvidenceUrl,
        avgUrl: portfolio.averageGradeEvidenceUrl,
        highUrl: portfolio.highGradeEvidenceUrl
      }
    };
  }
}
