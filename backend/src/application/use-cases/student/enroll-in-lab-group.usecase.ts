import { Id } from "@/domain/value-objects/index.js";
import {
  CourseMismatchError,
  EnrollmentNotFoundError,
  StudentAlreadyEnrolledInLabError,
} from "@/domain/errors/enrollment.errors.js";
import {
  LabGroupFullError,
  LabGroupNotFoundError,
} from "@/domain/errors/lab.errors.js";
import { NotAuthorizedError } from "@/application/errors/not-authorized.error.js";
import { type IUnitOfWork } from "@/application/contracts/i-unit-of-work.js";

/**
 * Input data for enrolling a student into a lab group.
 */
export interface EnrollInLabGroupInput {
  studentProfileId: string;
  enrollmentId: string;
  labGroupId: string;
}

/**
 * Use Case: Enroll a student in a single lab group.
 * Executes all operations within a single unit-of-work transaction.
 */
export class EnrollInLabGroupUseCase {
  constructor(private readonly uow: IUnitOfWork) {}

  public async execute(input: EnrollInLabGroupInput): Promise<void> {
    const studentIdVO = Id.create(input.studentProfileId);
    const enrollmentIdVO = Id.create(input.enrollmentId);
    const labGroupIdVO = Id.create(input.labGroupId);

    await this.uow.execute(async (repos) => {
      const enrollment = await repos.enrollment.findById(enrollmentIdVO);
      if (!enrollment) throw new EnrollmentNotFoundError(input.enrollmentId);

      if (!enrollment.studentId.equals(studentIdVO))
        throw new NotAuthorizedError();

      if (enrollment.labGroupId) throw new StudentAlreadyEnrolledInLabError();

      const labGroup = await repos.labGroup.findById(labGroupIdVO);
      if (!labGroup) throw new LabGroupNotFoundError(input.labGroupId);

      if (labGroup.isFull()) throw new LabGroupFullError();

      const theoryGroup = await repos.theoryGroup.findById(
        enrollment.theoryGroupId,
      );
      if (!theoryGroup || !theoryGroup.courseId.equals(labGroup.courseId)) {
        throw new CourseMismatchError();
      }

      labGroup.incrementEnrollment();
      enrollment.assignLab(labGroup.id);

      await repos.labGroup.save(labGroup);
      await repos.enrollment.save(enrollment);
    });
  }
}
