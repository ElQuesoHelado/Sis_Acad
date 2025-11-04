/**
 * @file Defines the StudentCode (CUI) Value Object.
 */

import { z } from "zod";
import { InvalidStudentCodeError } from "@/domain/errors/index.js";

/** Zod schema for validating a Student Code (CUI). Must be exactly 8 digits. */
const StudentCodeSchema = z
  .string()
  .trim()
  .regex(/^[0-9]{8}$/);

/**
 * Value Object representing a validated Student Code (CUI).
 * Immutable and guaranteed to be 8 digits.
 */
export class StudentCode {
  /** The validated student code. */
  public readonly value: string;

  /** Private constructor. Use `StudentCode.create()` instead. */
  private constructor(code: string) {
    this.value = code;
  }

  /**
   * Validates and creates a new StudentCode instance.
   * @param code - Raw, untrusted student code string.
   * @returns A new `StudentCode` instance.
   * @throws {InvalidStudentCodeError} If the code is invalid.
   */
  public static create(code: string): StudentCode {
    const result = StudentCodeSchema.safeParse(code);

    if (!result.success) {
      throw new InvalidStudentCodeError(result.error.issues[0]?.message);
    }

    return new StudentCode(result.data);
  }

  /**
   * Checks equality with another StudentCode.
   * @param other - Another `StudentCode` instance.
   * @returns `true` if both codes are identical.
   */
  public equals(other: StudentCode): boolean {
    return this.value === other.value;
  }

  /**
   * Returns the raw student code string.
   * @returns The student code.
   */
  public toString(): string {
    return this.value;
  }
}
