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
import { type ISystemConfigRepository } from "@/domain/repositories/isystem-config.repository.js";
import { OutsideEnrollmentPeriodError } from "@/application/errors/outside-enrollment-period.error.js";

interface ValidatedSelection {
  enrollment: Enrollment;
  labGroup: LabGroup;
}

/**
 * Use Case: Bulk enrollment into multiple lab groups.
 * Usa IUnitOfWork para transacciones atómicas.
 */
export class EnrollInLabGroupsUseCase {
  constructor(
    private readonly uow: IUnitOfWork,
    private readonly systemConfigRepo: ISystemConfigRepository,
  ) {}

  public async execute(
    studentProfileId: string,
    selections: LabEnrollmentSelectionDto[],
  ): Promise<void> {
    const studentIdVO = Id.create(studentProfileId);

    // First check if we're within the enrollment period
    await this.validateEnrollmentPeriod();

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

  private async validateEnrollmentPeriod(): Promise<void> {
    const startDateStr = await this.systemConfigRepo.get("LAB_ENROLLMENT_START_DATE");
    const endDateStr = await this.systemConfigRepo.get("LAB_ENROLLMENT_END_DATE");

    // If no enrollment period is defined, enrollment is not allowed
    if (!startDateStr || !endDateStr) {
      throw new OutsideEnrollmentPeriodError(
        "No hay un periodo de matrícula en laboratorios definido. La matrícula no está permitida."
      );
    }

    const now = new Date();
    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);

    // Normalize dates to compare only the date part (without time)
    const normalizeDate = (date: Date) => {
      const normalized = new Date(date);
      normalized.setHours(0, 0, 0, 0);
      return normalized;
    };

    const nowNormalized = normalizeDate(now);
    const startNormalized = normalizeDate(startDate);
    const endNormalized = normalizeDate(endDate);

    if (nowNormalized < startNormalized || nowNormalized > endNormalized) {
      throw new OutsideEnrollmentPeriodError(
        `La matrícula en laboratorios solo está permitida entre ${startDateStr} y ${endDateStr}`
      );
    }
  }
}
