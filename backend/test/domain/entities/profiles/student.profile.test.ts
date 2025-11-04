import { describe, it, expect, vi, afterEach } from "vitest";

import {
  StudentProfile,
  type StudentProfileCreateProps,
} from "@/domain/entities/profiles/student.profile.js";

import { Id, StudentCode } from "@/domain/value-objects/index.js";
import {
  InvalidUuidError,
  InvalidStudentCodeError,
  StudentProfileCreationError,
} from "@/domain/errors/index.js";

describe("Domain > Entity: StudentProfile", () => {
  const validProps: StudentProfileCreateProps = {
    id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    userId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22",
    studentCode: "20201234",
  };

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should create a valid StudentProfile instance with correct Value Objects", () => {
    const profile = StudentProfile.create(validProps);

    expect(profile).toBeInstanceOf(StudentProfile);

    expect(profile.id).toBeInstanceOf(Id);
    expect(profile.userId).toBeInstanceOf(Id);
    expect(profile.studentCode).toBeInstanceOf(StudentCode);

    expect(profile.id.value).toBe(validProps.id);
    expect(profile.userId.value).toBe(validProps.userId);
    expect(profile.studentCode.value).toBe(validProps.studentCode);
  });

  it("should throw InvalidUuidError if the entity ID is invalid", () => {
    const invalidProps = { ...validProps, id: "12345" };

    expect(() => StudentProfile.create(invalidProps)).toThrow(InvalidUuidError);
  });

  it("should throw InvalidUuidError if the userId is invalid", () => {
    const invalidProps = { ...validProps, userId: "not-a-uuid" };

    expect(() => StudentProfile.create(invalidProps)).toThrow(InvalidUuidError);
  });

  it("should throw InvalidStudentCodeError if studentCode is invalid", () => {
    const invalidProps = { ...validProps, studentCode: "not-a-code-123" };

    expect(() => StudentProfile.create(invalidProps)).toThrow(
      InvalidStudentCodeError,
    );
  });

  it("should throw StudentProfileCreationError for an unexpected internal error", () => {
    const unexpectedErrorMessage = "¡Error catastrófico de Zod!";

    vi.spyOn(Id, "create").mockImplementationOnce(() => {
      throw new Error(unexpectedErrorMessage);
    });

    expect(() => StudentProfile.create(validProps)).toThrow(
      StudentProfileCreationError,
    );
  });

  it("should throw StudentProfileCreationError for a non-Error throw", () => {
    vi.spyOn(StudentCode, "create").mockImplementationOnce(() => {
      throw "¡Unknown error!";
    });

    expect(() => StudentProfile.create(validProps)).toThrow(
      StudentProfileCreationError,
    );
  });
});
