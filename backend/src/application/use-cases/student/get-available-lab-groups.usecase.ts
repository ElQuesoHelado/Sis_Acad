import {
  type IEnrollmentRepository,
  type ITheoryGroupRepository,
  type ILabGroupRepository,
} from "@/domain/repositories/index.js";
import { Id } from "@/domain/value-objects/index.js";
import { type AvailableLabGroupDto } from "@/application/dtos/lab-group.dto.js";
import { EnrollmentNotFoundError } from "@/domain/errors/enrollment.errors.js";
import { NotAuthorizedError } from "@/application/errors/not-authorized.error.js";

export class GetAvailableLabGroupsUseCase {
  constructor(
    private readonly enrollmentRepository: IEnrollmentRepository,
    private readonly theoryGroupRepository: ITheoryGroupRepository,
    private readonly labGroupRepository: ILabGroupRepository,
  ) {}

  /**
   * Fetches lab groups available for a specific enrollment.
   */
  public async execute(
    studentProfileId: string,
    enrollmentId: string,
  ): Promise<AvailableLabGroupDto[]> {
    const studentIdVO = Id.create(studentProfileId);
    const enrollmentIdVO = Id.create(enrollmentId);

    // Find the enrollment
    const enrollment = await this.enrollmentRepository.findById(enrollmentIdVO);
    if (!enrollment) {
      throw new EnrollmentNotFoundError(enrollmentId);
    }

    // Authorize: Is this student the owner of the enrollment?
    if (!enrollment.studentId.equals(studentIdVO)) {
      throw new NotAuthorizedError(
        "You are not authorized to view labs for this enrollment.",
      );
    }

    // Business Rule: Already enrolled?
    if (enrollment.labGroupId) {
      return [];
    }

    //  Find the courseId from the theory group
    const theoryGroup = await this.theoryGroupRepository.findById(
      enrollment.theoryGroupId,
    );
    if (!theoryGroup) {
      // This is a data integrity issue
      throw new Error(
        `Data integrity error: TheoryGroup ${enrollment.theoryGroupId.value} not found.`,
      );
    }

    //  Find all labs for that course
    const allLabsForCourse = await this.labGroupRepository.findByCourse(
      theoryGroup.courseId,
    );

    // Filter labs that are not full
    const availableLabs = allLabsForCourse.filter((lab) => !lab.isFull());

    // Map to DTO
    return availableLabs.map((lab) => ({
      id: lab.id.value,
      groupLetter: lab.groupLetter.value,
      capacity: lab.capacity,
      currentEnrollment: lab.currentEnrollment,
      isFull: lab.isFull(),
    }));
  }
}
