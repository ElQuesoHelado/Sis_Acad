/**
 * @file Defines the core Course entity (catalog item).
 */

import { z } from "zod";
import { Entity } from "./base/entity.base.js";
import { CourseType } from "../enums/index.js";
import { CourseCode, Id, Credits } from "../value-objects/index.js";
import { CourseCreationError } from "../errors/course.errors.js";
import { DomainError, InvalidCourseNameError } from "../errors/index.js";

/** Properties for the private constructor (uses Value Objects). */
interface CourseProps {
  id: Id;
  code: CourseCode;
  name: string;
  credits: Credits;
  type: CourseType;
}

/** Raw properties for the factory (uses primitives). */
export interface CourseCreateProps {
  id: string;
  code: string;
  name: string;
  credits: number;
  type: CourseType;
}

/** Zod schema to validate the course name. */
const NameSchema = z.string().trim().min(5);

/** Represents a Course entity in the catalog. */
export class Course extends Entity {
  public readonly code: CourseCode;
  public readonly name: string;
  public readonly credits: Credits;
  public readonly type: CourseType;

  /** Private constructor. Use `Course.create()` instead. */
  private constructor(props: CourseProps) {
    super(props.id);
    this.code = props.code;
    this.name = props.name;
    this.credits = props.credits;
    this.type = props.type;
  }

  /**
   * Validates input and creates a new Course entity.
   * @param props - Raw course properties.
   * @returns A new `Course` instance.
   * @throws `DomainError` if validation fails.
   */
  public static create(props: CourseCreateProps): Course {
    try {
      const idVO = Id.create(props.id);
      const codeVO = CourseCode.create(props.code);
      const creditsVO = Credits.create(props.credits);

      const nameValidation = NameSchema.safeParse(props.name);
      if (!nameValidation.success) {
        throw new InvalidCourseNameError(
          nameValidation.error.issues[0]?.message,
        );
      }

      if (!Object.values(CourseType).includes(props.type)) {
        throw new CourseCreationError(
          new Error(`Invalid course type: ${props.type}`),
        );
      }

      return new Course({
        id: idVO,
        code: codeVO,
        name: nameValidation.data,
        credits: creditsVO,
        type: props.type,
      });
    } catch (error) {
      if (error instanceof DomainError) {
        throw error;
      }
      throw new CourseCreationError(
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  }
}
