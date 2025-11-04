/**
 * @file Defines the AcademicSemester Value Object and its validation schema.
 */

import { z } from "zod";
import { InvalidSemesterError } from "@/domain/errors/index.js";

/** Zod schema for validating an academic semester (YYYY-I or YYYY-II). */
const AcademicSemesterSchema = z
  .string()
  .trim()
  .regex(/^\d{4}-(I|II)$/);

/** Value Object representing a validated academic semester. */
export class AcademicSemester {
  /** Validated semester string (e.g., "2025-I"). */
  public readonly value: string;

  /** Private constructor. Use `AcademicSemester.create()` instead. */
  private constructor(semester: string) {
    this.value = semester;
  }

  /**
   * Validates and creates a new AcademicSemester instance.
   * @param semester - Raw, unvalidated semester string.
   * @returns A new `AcademicSemester` instance.
   * @throws `InvalidSemesterError` if the semester is invalid.
   */
  public static create(semester: string): AcademicSemester {
    const result = AcademicSemesterSchema.safeParse(semester?.trim());
    if (!result.success) {
      throw new InvalidSemesterError(result.error.issues[0]?.message);
    }
    return new AcademicSemester(result.data);
  }

  /**
   * Returns the year component of the semester.
   * @returns The year as a number (e.g., 2025).
   */
  public getYear(): number {
    return parseInt(this.value.substring(0, 4), 10);
  }

  /**
   * Returns the period component of the semester.
   * @returns "I" or "II".
   */
  public getPeriod(): "I" | "II" {
    return this.value.substring(5) as "I" | "II";
  }

  /**
   * Checks equality by comparing the semester value.
   * @param other - Another `AcademicSemester` instance.
   * @returns `true` if both semesters are identical.
   */
  public equals(other: AcademicSemester): boolean {
    return this.value === other.value;
  }

  /**
   * Returns the semester as a string.
   * @returns The semester value.
   */
  public toString(): string {
    return this.value;
  }
}
