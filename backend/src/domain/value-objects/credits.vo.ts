/**
 * @file Defines the Credits Value Object.
 */

import { z } from "zod";
import { InvalidCreditsError } from "@/domain/errors/index.js";

/** Zod schema for validating course credits (positive integer). */
const CreditsSchema = z.number().int().positive();

/** Value Object representing a validated number of course credits. */
export class Credits {
  /** Validated credits value. */
  public readonly value: number;

  /** Private constructor. Use `Credits.create()` instead. */
  private constructor(value: number) {
    this.value = value;
  }

  /**
   * Validates and creates a new Credits instance.
   * @param value - Raw, unvalidated credits value.
   * @returns A new `Credits` instance with a validated integer.
   * @throws `InvalidCreditsError` if the value is invalid.
   */
  public static create(value: number): Credits {
    const result = CreditsSchema.safeParse(value);

    if (!result.success) {
      throw new InvalidCreditsError(result.error.issues[0]?.message);
    }

    return new Credits(result.data);
  }

  /**
   * Checks equality by comparing the underlying number value.
   * @param other - Another `Credits` instance to compare against.
   * @returns `true` if both instances contain the same value; otherwise `false`.
   */
  public equals(other: Credits): boolean {
    return this.value === other.value;
  }

  /**
   * Returns the number of credits as a string.
   * @returns Credits value as a string.
   */
  public toString(): string {
    return this.value.toString();
  }
}
