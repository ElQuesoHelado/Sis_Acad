import { describe, it, expect, vi, afterEach } from "vitest";

import { User, type UserCreateProps } from "@/domain/entities/user.entity.js";

import { UserRole } from "@/domain/enums/index.js";
import { Email, Birthdate, Id } from "@/domain/value-objects/index.js";
import {
  InvalidEmailError,
  InvalidBirthdateError,
  InvalidNameError,
  InvalidPasswordError,
  InvalidUuidError,
  UserCreationError,
} from "@/domain/errors/index.js";

describe("Domain > Entity: User", () => {
  const validProps: UserCreateProps = {
    id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    email: "test@example.com",
    password: "hashed_password_string_largo_que_pasa_min_10",
    role: UserRole.STUDENT,
    name: "Juan",
    surname: "Perez",
    birthdate: "1990-01-01",
    status: true,
  };

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should create a valid User instance with correct Value Objects", () => {
    const user = User.create(validProps);

    expect(user).toBeInstanceOf(User);

    expect(user.id).toBeInstanceOf(Id);
    expect(user.email).toBeInstanceOf(Email);
    expect(user.birthdate).toBeInstanceOf(Birthdate);

    expect(user.id.value).toBe(validProps.id);
    expect(user.email.value).toBe("test@example.com");
    expect(user.name).toBe("Juan");
    expect(user.status).toBe(true);
    expect(user.role).toBe(UserRole.STUDENT);
  });

  it("should default status to true if not provided", () => {
    const props = { ...validProps };
    delete props.status;
    const user = User.create(props);
    expect(user.status).toBe(true);
  });

  it("should throw InvalidUuidError if ID is invalid", () => {
    const invalidProps = { ...validProps, id: "12345" };

    expect(() => User.create(invalidProps)).toThrow(InvalidUuidError);
  });

  it("should throw InvalidEmailError if email is invalid", () => {
    const invalidProps = { ...validProps, email: "not-an-email" };
    expect(() => User.create(invalidProps)).toThrow(InvalidEmailError);
  });

  it("should throw InvalidBirthdateError if birthdate is in the future", () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 1);
    const invalidProps = { ...validProps, birthdate: futureDate };

    expect(() => User.create(invalidProps)).toThrow(InvalidBirthdateError);
  });

  it("should throw InvalidNameError if name is too short", () => {
    const invalidProps = { ...validProps, name: "A" };

    expect(() => User.create(invalidProps)).toThrow(InvalidNameError);
  });

  it("should throw InvalidNameError if surname is empty", () => {
    const invalidProps = { ...validProps, surname: "  " };

    expect(() => User.create(invalidProps)).toThrow(InvalidNameError);
  });

  it("should throw InvalidPasswordError if password (hash) is too short", () => {
    const invalidProps = { ...validProps, password: "short" };

    expect(() => User.create(invalidProps)).toThrow(InvalidPasswordError);
  });

  it("should throw UserCreationError for an unexpected internal error", () => {
    const unexpectedErrorMessage = "¡Error de Zod catastrófico!";
    vi.spyOn(Email, "create").mockImplementationOnce(() => {
      throw new Error(unexpectedErrorMessage);
    });

    expect(() => User.create(validProps)).toThrow(UserCreationError);
  });
  it("should throw UserCreationError for a non-Error throw", () => {
    vi.spyOn(Email, "create").mockImplementationOnce(() => {
      throw "¡Unknown error!";
    });

    expect(() => User.create(validProps)).toThrow(UserCreationError);
  });
});
