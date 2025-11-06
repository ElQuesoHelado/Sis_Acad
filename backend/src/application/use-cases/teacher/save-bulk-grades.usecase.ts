import { Id } from "@/domain/value-objects/index.js";
import { Grade } from "@/domain/entities/grade.entity.js";
import { ClassType } from "@/domain/enums/index.js";
import { type SaveBulkGradesDto } from "@/application/dtos/grade.dto.js";
import { NotAuthorizedError } from "@/application/errors/not-authorized.error.js";
import { v4 as uuidv4 } from "uuid";
import { type IUnitOfWork } from "@/application/contracts/i-unit-of-work.js";
import type { TeacherAuthorizationService } from "@/application/services/teacher-authorization.service.js";

/**
 * Use Case: Save or update a batch of grades for a specific group.
 *
 * This use case validates that the teacher is authorized, checks
 * that all enrollments belong to the group, and performs an
 * upsert of the grades within a single transaction.
 */
export class SaveBulkGradesUseCase {
  constructor(
    private readonly uow: IUnitOfWork,
    private readonly authService: TeacherAuthorizationService,
  ) {}

  public async execute(input: SaveBulkGradesDto): Promise<void> {
    const teacherIdVO = Id.create(input.teacherUserId);
    const groupIdVO = Id.create(input.groupId);

    await this.uow.execute(async (repos) => {
      // Authorize the teacher for this group
      await this.authService.authorizeTeacherForGroup(
        teacherIdVO,
        groupIdVO,
        input.classType,
        repos.theoryGroup,
        repos.labGroup,
      );

      // Fetch all enrollments for the group
      const enrollments =
        input.classType === ClassType.THEORY
          ? await repos.enrollment.findByTheoryGroup(groupIdVO)
          : await repos.enrollment.findByLabGroup(groupIdVO);

      const validEnrollmentIds = new Set(enrollments.map((e) => e.id.value));

      const processedGrades: Grade[] = [];

      for (const entry of input.entries) {
        if (!validEnrollmentIds.has(entry.enrollmentId)) {
          throw new NotAuthorizedError(
            `Enrollment ${entry.enrollmentId} does not belong to this group.`,
          );
        }

        const enrollmentIdVO = Id.create(entry.enrollmentId);
        const existingGrade = await repos.grade.findByEnrollmentAndType(
          enrollmentIdVO,
          entry.type,
        );

        if (existingGrade) {
          existingGrade.updateScore(entry.score);
          processedGrades.push(existingGrade);
        } else {
          const newGrade = Grade.create({
            id: uuidv4(),
            enrollmentId: entry.enrollmentId,
            type: entry.type,
            score: entry.score,
          });
          processedGrades.push(newGrade);
        }
      }

      await repos.grade.saveMany(processedGrades);
    });
  }
}
