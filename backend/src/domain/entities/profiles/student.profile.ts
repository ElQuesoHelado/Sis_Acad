/**
 * @file Defines the StudentProfile entity, linking a User to their student-specific data.
 */

import { Entity } from "../base/entity.base.js";
import { Id, StudentCode } from "../../value-objects/index.js";
import {
  DomainError,
  StudentProfileCreationError,
} from "../../errors/index.js";

/** Internal validated properties using Value Objects. */
interface StudentProfileProps {
  id: Id;
  userId: Id;
  studentCode: StudentCode;
}

/** Raw properties for the factory (primitives). */
export interface StudentProfileCreateProps {
  id: string; // UUID
  userId: string; // User UUID
  studentCode: string; // Student Code (e.g., "20201234")
}

/** Entity representing a student's profile, linking a User to their student code. */
export class StudentProfile extends Entity {
  /** The User ID associated with this student profile. */
  public readonly userId: Id;

  /** The validated student code (CUI). */
  public readonly studentCode: StudentCode;

  /** Private constructor. Use `StudentProfile.create()` instead. */
  private constructor(props: StudentProfileProps) {
    super(props.id);
    this.userId = props.userId;
    this.studentCode = props.studentCode;
  }

  /**
   * Factory method to create a new StudentProfile instance.
   * @param props - Raw input properties.
   * @returns A validated `StudentProfile` instance.
   * @throws {DomainError} If any validation fails.
   */
  public static create(props: StudentProfileCreateProps): StudentProfile {
    try {
      const idVO = Id.create(props.id);
      const userIdVO = Id.create(props.userId);
      const studentCodeVO = StudentCode.create(props.studentCode);

      return new StudentProfile({
        id: idVO,
        userId: userIdVO,
        studentCode: studentCodeVO,
      });
    } catch (error) {
      if (error instanceof DomainError) {
        throw error;
      }

      throw new StudentProfileCreationError(
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  }
}
