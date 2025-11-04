/**
 * @file src/domain/entities/user.entity.ts
 * @fileoverview Defines the core User entity for the domain.
 */

import { z } from "zod";
import { Entity } from "./base/entity.base.js";
import type { UserRole } from "../enums/index.js";
import { Email, Birthdate, Id } from "../value-objects/index.js";
import {
  DomainError,
  InvalidNameError,
  InvalidPasswordError,
  UserCreationError,
} from "../errors/index.js";

/** Internal properties used by the private constructor (already validated). */
interface UserProps {
  id: Id;
  email: Email;
  password: string; // Hashed
  role: UserRole;
  name: string;
  surname: string;
  birthdate: Birthdate;
  picture?: string;
  status?: boolean;
}

/** Raw properties provided to the factory method (primitives). */
export interface UserCreateProps {
  id: string; // UUID
  email: string;
  password: string; // Hashed
  role: UserRole;
  name: string;
  surname: string;
  birthdate: Date | string;
  picture?: string;
  status?: boolean;
}

const NameSchema = z.string().trim().min(2);
const PasswordSchema = z.string().min(10);

/**
 * Represents a User entity in the domain.
 * @extends Entity
 */
export class User extends Entity {
  public readonly email: Email;
  public readonly password: string;
  public readonly role: UserRole;
  public readonly name: string;
  public readonly surname: string;
  public readonly birthdate: Birthdate;
  public readonly picture?: string;
  public readonly status: boolean;

  /**
   * Private constructor. Use `User.create()` to instantiate.
   * @param props - Validated properties with Value Objects.
   */
  private constructor(props: UserProps) {
    super(props.id);
    this.email = props.email;
    this.password = props.password;
    this.role = props.role;
    this.name = props.name;
    this.surname = props.surname;
    this.birthdate = props.birthdate;
    this.picture = props.picture;
    this.status = props.status ?? true; // Default: active
  }

  /**
   * Factory method to create a new User entity.
   * Validates primitives and creates Value Objects internally.
   * @param props - Raw user input (primitives).
   * @returns A new validated `User` instance.
   * @throws {DomainError} If any validation or business rule fails.
   */
  public static create(props: UserCreateProps): User {
    try {
      const idVO = Id.create(props.id);
      const emailVO = Email.create(props.email);
      const birthdateVO = Birthdate.create(props.birthdate);

      const nameValidation = NameSchema.safeParse(props.name);
      if (!nameValidation.success) {
        throw new InvalidNameError(nameValidation.error.issues[0]?.message);
      }

      const surnameValidation = NameSchema.safeParse(props.surname);
      if (!surnameValidation.success) {
        throw new InvalidNameError(surnameValidation.error.issues[0]?.message);
      }

      const passwordValidation = PasswordSchema.safeParse(props.password);
      if (!passwordValidation.success) {
        throw new InvalidPasswordError(
          passwordValidation.error.issues[0]?.message,
        );
      }

      return new User({
        id: idVO,
        email: emailVO,
        password: passwordValidation.data,
        role: props.role,
        name: nameValidation.data,
        surname: surnameValidation.data,
        birthdate: birthdateVO,
        picture: props.picture,
        status: props.status,
      });
    } catch (error) {
      if (error instanceof DomainError) {
        throw error;
      }

      throw new UserCreationError(
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  }
}
