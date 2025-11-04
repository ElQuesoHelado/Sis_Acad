/**
 * @file Defines the GroupLetter Value Object (A, B, C...).
 */

import { z } from "zod";
import { InvalidGroupLetterError } from "@/domain/errors/index.js";

/** Zod schema for validating a group letter (single uppercase char A-Z). */
const GroupLetterSchema = z
  .string()
  .trim()
  .length(1)
  .regex(/^[A-Z]$/, {
    message: "Group must be a single uppercase letter (A-Z).",
  });

/** Value Object representing a validated Group Letter (A, B, C...). */
export class GroupLetter {
  /** Validated uppercase letter. */
  public readonly value: string;

  /** Private constructor. Use `GroupLetter.create()` instead. */
  private constructor(letter: string) {
    this.value = letter;
  }

  /**
   * Validates and creates a new GroupLetter instance.
   * @param letter - Raw, unvalidated group letter input (e.g., "A").
   * @returns A validated `GroupLetter` instance.
   * @throws `InvalidGroupLetterError` if the input is invalid.
   */
  public static create(letter: string): GroupLetter {
    const result = GroupLetterSchema.safeParse(letter);

    if (!result.success) {
      throw new InvalidGroupLetterError(result.error.issues[0]?.message);
    }

    return new GroupLetter(result.data);
  }

  /**
   * Compares this GroupLetter with another for equality.
   * @param other - Another `GroupLetter` instance.
   * @returns `true` if both instances have the same value.
   */
  public equals(other: GroupLetter): boolean {
    return this.value === other.value;
  }

  /**
   * Returns the group letter as a string.
   * @returns The uppercase letter.
   */
  public toString(): string {
    return this.value;
  }
}
