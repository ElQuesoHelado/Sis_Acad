import type { Grade } from "@/domain/entities/grade.entity.js";
import { GradeType } from "@/domain/enums/grade-type.enum.js";
import type { GradeOutputDto } from "@/application/dtos/grade.dto.js";

/**
 * Maps domain grade types to human-readable names.
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
 * Converts a domain `Grade` entity to a `GradeOutputDto`.
 * @param grade - The domain grade entity.
 * @returns The output DTO.
 */
export function toGradeOutputDto(grade: Grade): GradeOutputDto {
  return {
    id: grade.id.value,
    type: grade.type,
    typeName: GradeTypeNames[grade.type] || "Grade",
    score: grade.score.value,
  };
}
