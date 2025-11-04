/**
 * @file Defines the Enrollment entity, linking a student to a specific
 * theory group and optionally a lab group.
 */

import { Entity } from "./base/entity.base.js";
import { Id } from "../value-objects/index.js";
import { DomainError, EnrollmentCreationError } from "../errors/index.js";

/** Internal validated properties (uses Value Objects). */
interface EnrollmentProps {
  id: Id;
  studentId: Id;
  theoryGroupId: Id;
  labGroupId: Id | null;
}

/** Raw properties for the factory method (uses primitives). */
export interface EnrollmentCreateProps {
  id: string; // UUID
  studentId: string; // UUID of the StudentProfile
  theoryGroupId: string; // UUID of the TheoryGroup
  labGroupId?: string | null; // UUID of the LabGroup (optional)
}

/**
 * Represents a student's enrollment in a TheoryGroup
 * and optionally in a LabGroup.
 * @extends Entity
 */
export class Enrollment extends Entity {
  public readonly studentId: Id;
  public readonly theoryGroupId: Id;
  public labGroupId: Id | null;

  /**
   * Private constructor. Use `Enrollment.create()` to instantiate.
   * @param props - Validated properties with Value Objects.
   */
  private constructor(props: EnrollmentProps) {
    super(props.id);
    this.studentId = props.studentId;
    this.theoryGroupId = props.theoryGroupId;
    this.labGroupId = props.labGroupId;
  }

  /**
   * Factory method to create a new Enrollment entity.
   * @param props - Raw properties (primitives).
   * @returns A new validated `Enrollment` instance.
   * @throws {DomainError} If any validation fails.
   */
  public static create(props: EnrollmentCreateProps): Enrollment {
    try {
      const idVO = Id.create(props.id);
      const studentIdVO = Id.create(props.studentId);
      const theoryGroupIdVO = Id.create(props.theoryGroupId);

      const labGroupIdVO = props.labGroupId
        ? Id.create(props.labGroupId)
        : null;

      return new Enrollment({
        id: idVO,
        studentId: studentIdVO,
        theoryGroupId: theoryGroupIdVO,
        labGroupId: labGroupIdVO,
      });
    } catch (error) {
      if (error instanceof DomainError) {
        throw error;
      }
      throw new EnrollmentCreationError(
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  }

  /**
   * Assigns a LabGroup to this enrollment.
   * Business rules (e.g., capacity check) should be handled in the Use Case.
   * @param labGroupId - The Id of the LabGroup to assign.
   */
  public assignLab(labGroupId: Id): void {
    if (this.labGroupId) {
      // NOTE: The Use Case decides whether to throw or allow reassignment.
      // throw new Error("Student is already assigned to a lab group.");
    }
    this.labGroupId = labGroupId;
  }

  /** Removes the student from the lab group. */
  public unassignLab(): void {
    this.labGroupId = null;
  }
}
