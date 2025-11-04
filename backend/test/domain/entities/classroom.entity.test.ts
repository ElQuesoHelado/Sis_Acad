import { describe, it, expect, vi, afterEach } from "vitest";
import {
  Classroom,
  type ClassroomCreateProps,
} from "@/domain/entities/classroom.entity.js";
import { Id } from "@/domain/value-objects/index.js";
import { ClassType } from "@/domain/enums/index.js";
import {
  ClassroomCreationError,
  InvalidUuidError,
} from "@/domain/errors/index.js";

describe("Domain > Entity: Classroom", () => {
  const validLabProps: ClassroomCreateProps = {
    id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    name: "Laboratorio C-105",
    type: ClassType.LAB,
    capacity: 30,
  };

  const validTheoryProps: ClassroomCreateProps = {
    id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22",
    name: "Salón A-201",
    type: ClassType.THEORY,
    capacity: 50,
  };

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should create a valid LAB Classroom instance", () => {
    const classroom = Classroom.create(validLabProps);
    expect(classroom).toBeInstanceOf(Classroom);
    expect(classroom.id).toBeInstanceOf(Id);
    expect(classroom.name).toBe(validLabProps.name);
    expect(classroom.type).toBe(ClassType.LAB);
    expect(classroom.capacity).toBe(30);
  });

  it("should create a valid THEORY Classroom instance", () => {
    const classroom = Classroom.create(validTheoryProps);
    expect(classroom).toBeInstanceOf(Classroom);
    expect(classroom.type).toBe(ClassType.THEORY);
    expect(classroom.capacity).toBe(50);
  });

  it("should throw InvalidUuidError if ID is invalid", () => {
    const invalidProps = { ...validLabProps, id: "123" };
    expect(() => Classroom.create(invalidProps)).toThrow(InvalidUuidError);
  });

  it("should throw ClassroomCreationError if name is too short", () => {
    const invalidProps = { ...validLabProps, name: "A" };
    expect(() => Classroom.create(invalidProps)).toThrow(
      ClassroomCreationError,
    );
  });

  it("should throw ClassroomCreationError if capacity is zero", () => {
    const invalidProps = { ...validLabProps, capacity: 0 };
    expect(() => Classroom.create(invalidProps)).toThrow(
      ClassroomCreationError,
    );
  });

  it("should throw ClassroomCreationError if capacity is negative", () => {
    const invalidProps = { ...validLabProps, capacity: -10 };
    expect(() => Classroom.create(invalidProps)).toThrow(
      ClassroomCreationError,
    );
  });

  it("should throw ClassroomCreationError if type is invalid", () => {
    const invalidProps = { ...validLabProps, type: "RECREO" as any };
    expect(() => Classroom.create(invalidProps)).toThrow(
      ClassroomCreationError,
    );
  });

  it("should re-throw DomainErrors directly if caught", () => {
    const knownError = new InvalidUuidError("ID inválido");
    vi.spyOn(Id, "create").mockImplementationOnce(() => {
      throw knownError;
    });
    expect(() => Classroom.create(validLabProps)).toThrow(InvalidUuidError);
  });

  it("should wrap generic Error errors in ClassroomCreationError", () => {
    const genericError = new Error("Unexpected DB error");
    vi.spyOn(Id, "create").mockImplementationOnce(() => {
      throw genericError;
    });

    expect(() => Classroom.create(validLabProps)).toThrow(
      ClassroomCreationError,
    );
    try {
      Classroom.create(validLabProps);
    } catch (error) {
      expect((error as ClassroomCreationError).cause).toBe(genericError);
    }
  });

  it("should wrap non-Error throws in ClassroomCreationError", () => {
    const errorString = "¡Error inesperado como string!";
    vi.spyOn(Id, "create").mockImplementationOnce(() => {
      throw errorString;
    });

    expect(() => Classroom.create(validLabProps)).toThrow(
      ClassroomCreationError,
    );
    try {
      Classroom.create(validLabProps);
    } catch (error) {
      expect(error as ClassroomCreationError).toBe(errorString);
    }
  });
});
