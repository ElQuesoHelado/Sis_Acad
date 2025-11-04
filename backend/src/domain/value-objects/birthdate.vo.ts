/**
 * @file Defines the Birthdate Value Object and its validation schema.
 */

import { z } from "zod";
import { InvalidBirthdateError } from "../errors/validation.errors.js";

/**
 * Zod schema for validating a birthdate.
 *
 * - Coerces input into a `Date`
 * - Ensures the date is not in the future
 */
const BirthdateSchema = z.preprocess(
  (arg) => (arg === null ? undefined : arg),
  z.coerce.date().max(new Date()),
);

/**
 * Value Object representing a validated and normalized birthdate.
 */
export class Birthdate {
  /**
   * Validated birthdate value.
   *
   * @readonly
   */
  public readonly value: Date;

  /**
   * Creates a Birthdate instance.
   *
   * @param date - A validated `Date` object.
   * @private Use `Birthdate.create()` instead.
   */
  private constructor(date: Date) {
    this.value = date;
  }

  /**
   * Validates, coerces, and creates a new Birthdate instance.
   *
   * Accepted input formats:
   * - `string` (ISO or coercible by JS `Date`)
   * - `Date` object
   *
   * @param input - Raw date input provided by the caller.
   * @returns A new `Birthdate` instance containing the validated date.
   * @throws Error If validation fails according to `BirthdateSchema`.
   */
  public static create(input: string | Date): Birthdate {
    const result = BirthdateSchema.safeParse(input);

    if (!result.success) {
      throw new InvalidBirthdateError(result.error.issues[0]?.message);
    }

    return new Birthdate(result.data);
  }

  /**
   * Compares this birthdate with another by comparing their timestamps.
   *
   * @param other - Another `Birthdate` instance to compare against.
   * @returns `true` if both instances represent the same date; otherwise `false`.
   */
  public equals(other: Birthdate): boolean {
    return this.value.getTime() === other.value.getTime();
  }

  /**
   * Returns the birthdate as an ISO-formatted string.
   *
   * @returns ISO string representation of the date.
   */
  public toString(): string {
    return this.value.toISOString();
  }
}
