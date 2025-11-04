import { describe, it, expect, vi, afterEach } from "vitest";

import {
  Enrollment,
  type EnrollmentCreateProps,
} from "@/domain/entities/enrollment.entity.js";
import { Id } from "@/domain/value-objects/index.js";
import {
  InvalidUuidError,
  EnrollmentCreationError,
} from "@/domain/errors/index.js";

describe("Domain > Entity: Enrollment", () => {
  const baseProps: EnrollmentCreateProps = {
    id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    studentId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22",
    theoryGroupId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33",
  };

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should create a valid Enrollment instance with null labGroupId", () => {
    const props = { ...baseProps, labGroupId: null };
    const enrollment = Enrollment.create(props);

    expect(enrollment).toBeInstanceOf(Enrollment);
    expect(enrollment.id).toBeInstanceOf(Id);
    expect(enrollment.studentId).toBeInstanceOf(Id);
    expect(enrollment.theoryGroupId).toBeInstanceOf(Id);
    expect(enrollment.labGroupId).toBeNull();
  });

  it("should create a valid Enrollment instance with a valid labGroupId", () => {
    const labId = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44";
    const props = { ...baseProps, labGroupId: labId };
    const enrollment = Enrollment.create(props);

    expect(enrollment.labGroupId).toBeInstanceOf(Id);
    expect(enrollment.labGroupId?.value).toBe(labId);
  });

  it("should throw InvalidUuidError if the entity ID is invalid", () => {
    const invalidProps = { ...baseProps, id: "123" };
    expect(() => Enrollment.create(invalidProps)).toThrow(InvalidUuidError);
  });

  it("should throw InvalidUuidError if the studentId is invalid", () => {
    const invalidProps = { ...baseProps, studentId: "not-a-uuid" };
    expect(() => Enrollment.create(invalidProps)).toThrow(InvalidUuidError);
  });

  it("should throw InvalidUuidError if the theoryGroupId is invalid", () => {
    // <-- CAMBIADO
    const invalidProps = { ...baseProps, theoryGroupId: "bad-id" }; // <-- CAMBIADO
    expect(() => Enrollment.create(invalidProps)).toThrow(InvalidUuidError);
  });

  it("should throw InvalidUuidError if the labGroupId is provided but invalid", () => {
    const invalidProps = { ...baseProps, labGroupId: "invalid-lab-id" };
    expect(() => Enrollment.create(invalidProps)).toThrow(InvalidUuidError);
  });

  it("should correctly assign a lab group via assignLab()", () => {
    const enrollment = Enrollment.create(baseProps);
    expect(enrollment.labGroupId).toBeNull();

    const labId = Id.create("a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44");
    enrollment.assignLab(labId);

    expect(enrollment.labGroupId).toBe(labId);
  });

  it("should correctly unassign a lab group via unassignLab()", () => {
    const labId = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44";
    const enrollment = Enrollment.create({ ...baseProps, labGroupId: labId });

    expect(enrollment.labGroupId).toBeInstanceOf(Id);

    enrollment.unassignLab();
    expect(enrollment.labGroupId).toBeNull();
  });

  it("should allow re-assigning a lab group (overwrite existing value)", () => {
    const initialLabId = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44";
    const enrollment = Enrollment.create({
      ...baseProps,
      labGroupId: initialLabId,
    });

    expect(enrollment.labGroupId?.value).toBe(initialLabId);

    const newLabId = Id.create("a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a55");
    enrollment.assignLab(newLabId);

    expect(enrollment.labGroupId?.value).toBe(newLabId.value);
  });

  it("should re-throw DomainErrors directly if caught", () => {
    const knownError = new InvalidUuidError("ID inválido");
    vi.spyOn(Id, "create").mockImplementationOnce(() => {
      throw knownError;
    });
    expect(() => Enrollment.create(baseProps)).toThrow(InvalidUuidError);
  });

  it("should wrap non-Error throws in EnrollmentCreationError", () => {
    const errorString = "¡Error inesperado como string!";
    vi.spyOn(Id, "create").mockImplementationOnce(() => {
      throw errorString;
    });

    expect(() => Enrollment.create(baseProps)).toThrow(EnrollmentCreationError);
    try {
      Enrollment.create(baseProps);
    } catch (error) {
      expect(error as EnrollmentCreationError).toBe(errorString);
    }
  });
  it("should wrap generic Error errors in EnrollmentCreationError", () => {
    const genericError = new Error("Unexpected DB error");
    vi.spyOn(Id, "create").mockImplementationOnce(() => {
      throw genericError;
    });

    expect(() => Enrollment.create(baseProps)).toThrow(EnrollmentCreationError);

    try {
      Enrollment.create(baseProps);
    } catch (error) {
      expect(error).toBeInstanceOf(EnrollmentCreationError);
      expect((error as EnrollmentCreationError).cause).toBe(genericError);
    }
  });
});
