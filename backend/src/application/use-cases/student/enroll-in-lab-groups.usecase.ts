import { Id } from "@/domain/value-objects/index.js";
import {
  CourseMismatchError,
  EnrollmentNotFoundError,
  StudentAlreadyEnrolledInLabError,
  BulkEnrollmentError,
} from "@/domain/errors/enrollment.errors.js";
import {
  LabGroupFullError,
  LabGroupNotFoundError,
} from "@/domain/errors/lab.errors.js";
import { NotAuthorizedError } from "@/application/errors/not-authorized.error.js";
import { type LabEnrollmentSelectionDto } from "@/application/dtos/enrollment.dto.js";
import type { LabGroup } from "@/domain/entities/lab-group.entity.js";
import type { Enrollment } from "@/domain/entities/enrollment.entity.js";
import { type IUnitOfWork } from "@/application/contracts/i-unit-of-work.js";

interface ValidatedSelection {
  enrollment: Enrollment;
  labGroup: LabGroup;
}

/**
 * Use Case: Bulk enrollment into multiple lab groups.
 * Usa IUnitOfWork para transacciones atómicas.
 */
export class EnrollInLabGroupsUseCase {
  constructor(private readonly uow: IUnitOfWork) {}

  public async execute(
    studentProfileId: string,
    selections: LabEnrollmentSelectionDto[],
  ): Promise<void> {
    const studentIdVO = Id.create(studentProfileId);

    await this.uow.execute(async (repos) => {
      const validatedSelections: ValidatedSelection[] = [];

      // Validation
      for (const selection of selections) {
        const enrollment = await repos.enrollment.findById(
          Id.create(selection.enrollmentId),
        );
        if (!enrollment) {
          throw new EnrollmentNotFoundError(selection.enrollmentId);
        }

        const labGroup = await repos.labGroup.findById(
          Id.create(selection.labGroupId),
        );
        if (!labGroup) {
          throw new LabGroupNotFoundError(selection.labGroupId);
        }

        const theoryGroup = await repos.theoryGroup.findById(
          enrollment.theoryGroupId,
        );
        if (!theoryGroup) {
          throw new BulkEnrollmentError(
            `TheoryGroup for enrollment ${selection.enrollmentId} not found.`,
          );
        }

        if (!enrollment.studentId.equals(studentIdVO)) {
          throw new NotAuthorizedError(
            `Not authorized for enrollment ${selection.enrollmentId}.`,
          );
        }
        if (enrollment.labGroupId) {
          throw new StudentAlreadyEnrolledInLabError();
        }
        if (labGroup.isFull()) {
          throw new LabGroupFullError(
            `Lab Group ${labGroup.groupLetter.value} is already full.`,
          );
        }
        if (!theoryGroup.courseId.equals(labGroup.courseId)) {
          throw new CourseMismatchError();
        }

        validatedSelections.push({ enrollment, labGroup });
      }

      // Execute
      try {
        const allSaves: Promise<void>[] = [];

        for (const { enrollment, labGroup } of validatedSelections) {
          enrollment.assignLab(labGroup.id);
          labGroup.incrementEnrollment();

          allSaves.push(repos.enrollment.save(enrollment));
          allSaves.push(repos.labGroup.save(labGroup));
        }

        await Promise.all(allSaves);
      } catch (error: any) {
        throw new BulkEnrollmentError(
          `A database error occurred during bulk save: ${error.message}`,
        );
      }
    });
  }
}
