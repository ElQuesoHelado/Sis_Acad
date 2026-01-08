/**
 * @file Defines the TheoryGroup entity (the "Course Offering").
 * This represents a specific theory section of a course in a semester.
 */

import { Entity } from "./base/entity.base.js";
import { Id, GroupLetter, AcademicSemester } from "../value-objects/index.js";
import { DomainError, TheoryGroupCreationError } from "../errors/index.js";

/** Internal validated properties (uses Value Objects). */
interface TheoryGroupProps {
  id: Id;
  courseId: Id; // ID of the course (catalog)
  professorId: Id;
  semester: AcademicSemester;
  groupLetter: GroupLetter; // "A", "B", "C"...
}

/** Raw properties for the factory method (uses primitives). */
export interface TheoryGroupCreateProps {
  id: string; // UUID
  courseId: string; // UUID of the Course
  professorId: string; // UUID of the User (professor)
  semester: string; // e.g., "2024-I", "2024-II", "2025-I", "2025-II"
  groupLetter: string; // e.g., "A"
}

/**
 * Represents a Theory Group offered for a course in a semester.
 * This is the main entity for "Class Schedule" theory sections.
 * @extends Entity
 */
export class TheoryGroup extends Entity {
  public readonly courseId: Id;
  public readonly professorId: Id;
  public readonly semester: AcademicSemester;
  public readonly groupLetter: GroupLetter;

  /**
   * Private constructor. Use `TheoryGroup.create()` to instantiate.
   * @param props - Validated properties.
   */
  private constructor(props: TheoryGroupProps) {
    super(props.id);
    this.courseId = props.courseId;
    this.professorId = props.professorId;
    this.semester = props.semester;
    this.groupLetter = props.groupLetter;
  }

  /**
   * Factory method to create a new TheoryGroup entity.
   * @param props - Raw properties (primitives).
   * @returns A new validated `TheoryGroup` instance.
   * @throws {DomainError} If any validation fails.
   */
  public static create(props: TheoryGroupCreateProps): TheoryGroup {
    try {
      const idVO = Id.create(props.id);
      const courseIdVO = Id.create(props.courseId);
      const professorIdVO = Id.create(props.professorId);
      const semesterVO = AcademicSemester.create(props.semester);
      const groupLetterVO = GroupLetter.create(props.groupLetter);

      return new TheoryGroup({
        id: idVO,
        courseId: courseIdVO,
        professorId: professorIdVO,
        semester: semesterVO,
        groupLetter: groupLetterVO,
      });
    } catch (error) {
      if (error instanceof DomainError) {
        throw error;
      }
      throw new TheoryGroupCreationError(
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  }

  /**
   * Returns a human-readable name for the group.
   * @returns e.g., "Group A"
   */
  public getDisplayName(): string {
    return `Grupo ${this.groupLetter.value}`;
  }
}
