/**
 * @file Defines the CourseCode Value Object.
 */

import { z } from "zod";
import { InvalidCourseCodeError } from "@/domain/errors/index.js";

/** Zod schema for validating a course code (exactly 8 digits). */
const CourseCodeSchema = z
  .string()
  .trim()
  .regex(/^[0-9]{8}$/);

/** Value Object representing a validated course code. */
export class CourseCode {
  /** The validated course code value. */
  public readonly value: string;

  /** Private constructor. Use `CourseCode.create()` instead. */
  private constructor(code: string) {
    this.value = code;
  }

  /**
   * Validates and creates a new CourseCode instance.
   * @param code - Raw, unvalidated course code input.
   * @returns A new `CourseCode` instance.
   * @throws `InvalidCourseCodeError` if validation fails.
   */
  public static create(code: string): CourseCode {
    const result = CourseCodeSchema.safeParse(code?.trim());

    if (!result.success) {
      throw new InvalidCourseCodeError(result.error.issues[0]?.message);
    }

    return new CourseCode(result.data);
  }

  /**
   * Checks equality by comparing values.
   * @param other - Another `CourseCode` instance.
   * @returns `true` if both contain the same value.
   */
  public equals(other: CourseCode): boolean {
    return this.value === other.value;
  }

  /**
   * Returns the course code value.
   * @returns The course code as a string.
   */
  public toString(): string {
    return this.value;
  }
}
