/**
 * @file Defines the ID Value Object (UUID).
 */

import { z } from "zod";
import { InvalidUuidError } from "@/domain/errors/validation.errors.js";

/** Zod schema for validating a UUID string. */
const UuidSchema = z.uuid();

/** Represents a validated UUID as a Value Object. */
export class Id {
  /** Validated UUID string. */
  public readonly value: string;

  /** Private constructor. Use `Id.create()` instead. */
  private constructor(id: string) {
    this.value = id;
  }

  /**
   * Validates and creates a new Id instance.
   * @param id - Raw, untrusted UUID string.
   * @returns A new `Id` instance.
   * @throws `InvalidUuidError` if the ID is not a valid UUID.
   */
  public static create(id: string): Id {
    const result = UuidSchema.safeParse(id);

    if (!result.success) {
      throw new InvalidUuidError(result.error.issues[0]?.message);
    }

    return new Id(result.data);
  }

  /**
   * Checks equality with another Id instance.
   * @param other - Another `Id` to compare against.
   * @returns `true` if both Ids are identical.
   */
  public equals(other: Id): boolean {
    return this.value === other.value;
  }

  /**
   * Returns the primitive string value of the Id.
   * @returns The UUID string.
   */
  public toString(): string {
    return this.value;
  }
}
