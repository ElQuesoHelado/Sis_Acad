import {
  type IEnrollmentRepository,
  type IGradeRepository,
} from "@/domain/repositories/index.js";
import { Id, AcademicSemester } from "@/domain/value-objects/index.js";
import { toGradeOutputDto } from "@/application/mappers/grade.mapper.js";
import {
  type StudentCourseGradesDto,
  type GroupGradeStatsDto,
  type GradeWeightDto,
  type CourseStatus,
} from "@/application/dtos/student-grades.dto.js";
import type { Grade } from "@/domain/entities/grade.entity.js";
import type { GradeWeight } from "@/domain/entities/grade-weight.entity.js";
import type { GradeType } from "@/domain/enums/grade-type.enum.js";

const APPROVAL_SCORE = 10.5;

export class GetStudentGradesBySemesterUseCase {
  constructor(
    private readonly enrollmentRepository: IEnrollmentRepository,
    private readonly gradeRepository: IGradeRepository
  ) { }

  public async execute(
    studentProfileId: string,
    semester: string,
  ): Promise<StudentCourseGradesDto[]> {
    const studentIdVO = Id.create(studentProfileId);
    const semesterVO = AcademicSemester.create(semester);

    // Fetch courses, grades, and grade weights in a single call
    const details = await this.enrollmentRepository.findStudentSemesterDetails(
      studentIdVO,
      semesterVO
    );

    if (details.length === 0) return [];

    // Fetch global grade statistics for all theory groups involved
    const theoryGroupIds = details.map((d) => Id.create(d.theoryGroupId));
    const allStats = await this.gradeRepository.findStatsByTheoryGroupIds(
      theoryGroupIds,
    );

    return details.map((detail) => {
      const { average, status } = this.calculateAverageAndStatus(
        detail.grades,
        detail.weights,
      );

      const groupStats: GroupGradeStatsDto[] = allStats
        .filter((s) => s.theoryGroupId === detail.theoryGroupId)
        .map((s) => ({
          type: s.type,
          average: Number(s.average.toFixed(2)),
          max: s.max,
          min: s.min,
        }));

      const weightsDto: GradeWeightDto[] = detail.weights.map((w) => ({
        type: w.type,
        weight: w.weight.value,
      }));

      return {
        enrollmentId: detail.enrollment.id.value,
        courseName: detail.courseName,
        professorName: detail.professorName,
        grades: detail.grades.map(toGradeOutputDto),
        average,
        status,
        groupStats,
        weights: weightsDto,
      };
    });
  }

  /**
   * Calculates weighted average and course status.
   */
  private calculateAverageAndStatus(
    grades: Grade[],
    weights: GradeWeight[],
  ): { average: number | null; status: CourseStatus } {
    const totalWeight = weights.reduce((sum, w) => sum + w.weight.value, 0);

    if (weights.length === 0 || totalWeight === 0) {
      return { average: null, status: "En Progreso" };
    }

    const weightMap = new Map<GradeType, number>();
    for (const w of weights) weightMap.set(w.type, w.weight.value);

    const gradeMap = new Map<GradeType, number>();
    for (const g of grades) gradeMap.set(g.type, g.score.value);

    let finalAverage = 0;
    let allGradesPosted = true;

    for (const [type, weight] of weightMap.entries()) {
      const score = gradeMap.get(type);

      if (score === undefined || score === null) {
        allGradesPosted = false;
      } else {
        finalAverage += score * (weight / 100);
      }
    }

    finalAverage = Math.round(finalAverage * 100) / 100;

    let status: CourseStatus = "En Progreso";
    if (allGradesPosted) {
      status = finalAverage >= APPROVAL_SCORE ? "Aprobado" : "Desaprobado";
    }

    return { average: finalAverage, status };
  }
}

