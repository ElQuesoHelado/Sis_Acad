/**
 * @file Defines the Email Value Object and its validation schema.
 */

import { z } from "zod";
import { InvalidEmailError } from "@/domain/errors/validation.errors.js";

/** Zod schema for validating an email address (RFC 5322–compatible). */
const EmailSchema = z
  .email()
  .trim()
  .min(1)
  .transform((val) => val.toLowerCase());

/** Value Object representing a validated and normalized email address. */
export class Email {
  /** Validated and normalized email value. */
  public readonly value: string;

  /** Private constructor. Use `Email.create()` instead. */
  private constructor(address: string) {
    this.value = address;
  }

  /**
   * Validates, normalizes, and creates a new Email instance.
   * @param address - Raw, unvalidated email input.
   * @returns A new `Email` instance with the normalized email string.
   * @throws `InvalidEmailError` if the email is not valid.
   */
  public static create(address: string): Email {
    const result = EmailSchema.safeParse(address?.trim());

    if (!result.success) {
      throw new InvalidEmailError(result.error.issues[0]?.message);
    }

    return new Email(result.data);
  }

  /**
   * Checks equality by comparing the underlying email values.
   * @param other - Another `Email` instance to compare against.
   * @returns `true` if both instances contain the same value; otherwise `false`.
   */
  public equals(other: Email): boolean {
    return this.value === other.value;
  }

  /**
   * Returns the normalized email string.
   * @returns The email value as a string.
   */
  public toString(): string {
    return this.value;
  }
}
