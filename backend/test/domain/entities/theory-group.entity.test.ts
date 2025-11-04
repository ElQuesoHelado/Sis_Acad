import { describe, it, expect, vi, afterEach } from "vitest";
import {
  TheoryGroup,
  type TheoryGroupCreateProps,
} from "@/domain/entities/theory-group.entity.js";
import {
  Id,
  GroupLetter,
  AcademicSemester,
} from "@/domain/value-objects/index.js";
import {
  InvalidUuidError,
  InvalidGroupLetterError,
  InvalidSemesterError,
  TheoryGroupCreationError,
} from "@/domain/errors/index.js";

describe("Domain > Entity: TheoryGroup", () => {
  const validProps: TheoryGroupCreateProps = {
    id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    courseId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22",
    professorId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33",
    semester: "2024-I",
    groupLetter: "A",
  };

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should create a valid TheoryGroup instance with correct VOs", () => {
    const group = TheoryGroup.create(validProps);

    expect(group).toBeInstanceOf(TheoryGroup);
    expect(group.id).toBeInstanceOf(Id);
    expect(group.courseId).toBeInstanceOf(Id);
    expect(group.professorId).toBeInstanceOf(Id);
    expect(group.semester).toBeInstanceOf(AcademicSemester);
    expect(group.groupLetter).toBeInstanceOf(GroupLetter);
    expect(group.getDisplayName()).toBe("Grupo A");
    expect(group.semester.value).toBe("2024-I");
  });

  it("should throw InvalidUuidError if courseId is invalid", () => {
    const invalidProps = { ...validProps, courseId: "123" };
    expect(() => TheoryGroup.create(invalidProps)).toThrow(InvalidUuidError);
  });

  it("should throw InvalidUuidError if professorId is invalid", () => {
    const invalidProps = { ...validProps, professorId: "abc" };
    expect(() => TheoryGroup.create(invalidProps)).toThrow(InvalidUuidError);
  });

  it("should throw InvalidSemesterError if semester is invalid", () => {
    const invalidProps = { ...validProps, semester: "2024-III" };
    expect(() => TheoryGroup.create(invalidProps)).toThrow(
      InvalidSemesterError,
    );
  });

  it("should throw InvalidGroupLetterError if groupLetter is invalid", () => {
    const invalidProps = { ...validProps, groupLetter: "abc" };
    expect(() => TheoryGroup.create(invalidProps)).toThrow(
      InvalidGroupLetterError,
    );
  });

  it("should re-throw DomainErrors directly if caught", () => {
    const knownError = new InvalidUuidError("ID inválido");
    vi.spyOn(Id, "create").mockImplementationOnce(() => {
      throw knownError;
    });
    expect(() => TheoryGroup.create(validProps)).toThrow(InvalidUuidError);
  });

  it("should wrap generic Error errors in TheoryGroupCreationError", () => {
    const genericError = new Error("Unexpected DB error");
    vi.spyOn(Id, "create").mockImplementationOnce(() => {
      throw genericError;
    });

    expect(() => TheoryGroup.create(validProps)).toThrow(
      TheoryGroupCreationError,
    );
    try {
      TheoryGroup.create(validProps);
    } catch (error) {
      expect((error as TheoryGroupCreationError).cause).toBe(genericError);
    }
  });

  it("should wrap non-Error throws in TheoryGroupCreationError", () => {
    const errorString = "¡Error inesperado como string!";
    vi.spyOn(Id, "create").mockImplementationOnce(() => {
      throw errorString;
    });

    expect(() => TheoryGroup.create(validProps)).toThrow(
      TheoryGroupCreationError,
    );
    try {
      TheoryGroup.create(validProps);
    } catch (error) {
      expect(error as TheoryGroupCreationError).toBe(errorString);
    }
  });
});
