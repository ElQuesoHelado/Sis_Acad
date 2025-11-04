/**
 * @file test/domain/entities/profiles/teacher.profile.test.ts
 * @fileoverview Unit tests for the TeacherProfile entity.
 */

import { describe, it, expect, vi, afterEach } from "vitest";

import {
  TeacherProfile,
  type TeacherProfileCreateProps,
} from "@/domain/entities/profiles/teacher.profile.js";

import { Id } from "@/domain/value-objects/index.js";
import {
  InvalidUuidError,
  TeacherProfileCreationError,
  DomainError,
} from "@/domain/errors/index.js";

describe("Domain > Entity: TeacherProfile", () => {
  const validProps: TeacherProfileCreateProps = {
    id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    userId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22",
    specialization: "Inteligencia Artificial",
  };

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should create a valid TeacherProfile instance with correct values", () => {
    const profile = TeacherProfile.create(validProps);

    expect(profile).toBeInstanceOf(TeacherProfile);
    expect(profile.id).toBeInstanceOf(Id);
    expect(profile.userId).toBeInstanceOf(Id);
    expect(profile.specialization).toBe(validProps.specialization);
  });

  it("should throw InvalidUuidError if the entity ID is invalid", () => {
    const invalidProps = { ...validProps, id: "12345" };
    expect(() => TeacherProfile.create(invalidProps)).toThrow(InvalidUuidError);
  });

  it("should throw InvalidUuidError if the userId is invalid", () => {
    const invalidProps = { ...validProps, userId: "not-a-uuid" };
    expect(() => TeacherProfile.create(invalidProps)).toThrow(InvalidUuidError);
  });

  it("should throw TeacherProfileCreationError if specialization is too short", () => {
    const invalidProps = { ...validProps, specialization: "AI" };
    expect(() => TeacherProfile.create(invalidProps)).toThrow(
      TeacherProfileCreationError,
    );
  });

  it("should throw TeacherProfileCreationError if specialization is empty", () => {
    const invalidProps = { ...validProps, specialization: "  " };
    expect(() => TeacherProfile.create(invalidProps)).toThrow(
      TeacherProfileCreationError,
    );
  });

  // --- Tests de Cobertura de 'catch' ---

  it("should re-throw DomainErrors directly if caught", () => {
    const knownError = new InvalidUuidError("ID inválido");
    vi.spyOn(Id, "create").mockImplementationOnce(() => {
      throw knownError;
    });
    expect(() => TeacherProfile.create(validProps)).toThrow(InvalidUuidError);
  });

  it("should wrap generic Error errors in TeacherProfileCreationError", () => {
    const genericError = new Error("Unexpected error");
    vi.spyOn(Id, "create").mockImplementationOnce(() => {
      throw genericError;
    });

    expect(() => TeacherProfile.create(validProps)).toThrow(
      TeacherProfileCreationError,
    );
    try {
      TeacherProfile.create(validProps);
    } catch (error) {
      expect((error as TeacherProfileCreationError).cause).toBe(genericError);
    }
  });

  it("should wrap non-Error throws in TeacherProfileCreationError", () => {
    const errorString = "String error";
    vi.spyOn(Id, "create").mockImplementationOnce(() => {
      throw errorString;
    });

    expect(() => TeacherProfile.create(validProps)).toThrow(
      TeacherProfileCreationError,
    );
    try {
      TeacherProfile.create(validProps);
    } catch (error) {
      expect(error as TeacherProfileCreationError).toBe(errorString);
    }
  });
});
