import { type IGradeRepository } from "@/domain/repositories/igrade.repository.js";
import { type IEnrollmentRepository } from "@/domain/repositories/ienrollment.repository.js";
import { Id } from "@/domain/value-objects/index.js";
import { type GradeOutputDto } from "@/application/dtos/grade.dto.js";
import type { Grade } from "@/domain/entities/grade.entity.js";
import { GradeType } from "@/domain/enums/grade-type.enum.js";

export class EnrollmentNotFoundError extends Error {
  constructor(id: string) {
    super(`Enrollment with ID ${id} was not found.`);
    this.name = "EnrollmentNotFoundError";
  }
}

export class NotAuthorizedError extends Error {
  constructor() {
    super("You are not authorized to view grades for this enrollment.");
    this.name = "NotAuthorizedError";
  }
}

/**
 * Map from enum grade types to human-readable names.
 * This is application-level presentation logic.
 */
const GradeTypeNames: Record<GradeType, string> = {
  [GradeType.PARTIAL_1]: "Parcial 1",
  [GradeType.PARTIAL_2]: "Parcial 2",
  [GradeType.PARTIAL_3]: "Parcial 3",
  [GradeType.CONTINUOUS_1]: "Continua 1",
  [GradeType.CONTINUOUS_2]: "Continua 2",
  [GradeType.CONTINUOUS_3]: "Continua 3",
};

/**
 * Use Case: Retrieve all grades for a specific enrollment.
 * Ensures the student can only access their own grades.
 */
export class GetGradesByEnrollmentUseCase {
  constructor(
    private readonly gradeRepository: IGradeRepository,
    private readonly enrollmentRepository: IEnrollmentRepository,
  ) {}

  /**
   * Executes the use case.
   * @param studentProfileId - The ID of the authenticated student's profile.
   * @param enrollmentId - The ID of the enrollment to query.
   * @returns A list of grade DTOs.
   */
  public async execute(
    studentProfileId: string,
    enrollmentId: string,
  ): Promise<GradeOutputDto[]> {
    const enrollmentIdVO = Id.create(enrollmentId);
    const studentIdVO = Id.create(studentProfileId);

    const enrollment = await this.enrollmentRepository.findById(enrollmentIdVO);
    if (!enrollment) {
      throw new EnrollmentNotFoundError(enrollmentId);
    }

    if (!enrollment.studentId.equals(studentIdVO)) {
      throw new NotAuthorizedError();
    }

    const grades: Grade[] =
      await this.gradeRepository.findByEnrollmentId(enrollmentIdVO);

    return grades.map((grade) => ({
      id: grade.id.value,
      type: grade.type,
      typeName: GradeTypeNames[grade.type] || "Grade",
      score: grade.score.value,
    }));
  }
}
