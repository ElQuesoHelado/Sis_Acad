import { describe, it, expect, vi, afterEach } from "vitest";
import {
  Grade,
  type GradeCreateProps,
} from "@/domain/entities/grade.entity.js";
import { GradeType } from "@/domain/enums/index.js";
import { Id, Score } from "@/domain/value-objects/index.js";
import {
  InvalidUuidError,
  InvalidScoreError,
  GradeCreationError,
  InvalidGradeTypeError,
} from "@/domain/errors/index.js";

describe("Domain > Entity: Grade", () => {
  const validProps: GradeCreateProps = {
    id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    enrollmentId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22",
    type: GradeType.PARTIAL_1,
    score: 15.5,
  };

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should create a valid Grade instance", () => {
    const grade = Grade.create(validProps);

    expect(grade).toBeInstanceOf(Grade);
    expect(grade.id).toBeInstanceOf(Id);
    expect(grade.enrollmentId).toBeInstanceOf(Id);
    expect(grade.score).toBeInstanceOf(Score);
    expect(grade.score.value).toBe(15.5);
    expect(grade.type).toBe(GradeType.PARTIAL_1);
  });

  it("should throw InvalidUuidError if enrollmentId is invalid", () => {
    const invalidProps = { ...validProps, enrollmentId: "123" };
    expect(() => Grade.create(invalidProps)).toThrow(InvalidUuidError);
  });

  it("should throw InvalidScoreError if score is below 0", () => {
    const invalidProps = { ...validProps, score: -1 };
    expect(() => Grade.create(invalidProps)).toThrow(InvalidScoreError);
  });

  it("should throw InvalidScoreError if score is above 20", () => {
    const invalidProps = { ...validProps, score: 20.1 };
    expect(() => Grade.create(invalidProps)).toThrow(InvalidScoreError);
  });

  it("should throw InvalidGradeTypeError if GradeType is invalid", () => {
    const invalidProps = { ...validProps, type: "EXAMEN_FINAL" as any };
    expect(() => Grade.create(invalidProps)).toThrow(InvalidGradeTypeError);
  });

  it("should correctly update the score", () => {
    const grade = Grade.create(validProps);
    expect(grade.score.value).toBe(15.5);

    grade.updateScore(18);
    expect(grade.score.value).toBe(18);
  });

  it("should throw InvalidScoreError when updating with an invalid score", () => {
    const grade = Grade.create(validProps);
    expect(() => grade.updateScore(25)).toThrow(InvalidScoreError);
  });

  it("should re-throw DomainErrors directly if caught", () => {
    const knownError = new InvalidUuidError("ID inválido");
    vi.spyOn(Id, "create").mockImplementationOnce(() => {
      throw knownError;
    });
    expect(() => Grade.create(validProps)).toThrow(InvalidUuidError);
  });

  it("should wrap generic Error errors in GradeCreationError", () => {
    const genericError = new Error("Error inesperado de base de datos");
    vi.spyOn(Id, "create").mockImplementationOnce(() => {
      throw genericError;
    });

    expect(() => Grade.create(validProps)).toThrow(GradeCreationError);

    try {
      Grade.create(validProps);
    } catch (error) {
      expect(error).toBeInstanceOf(GradeCreationError);
      expect((error as GradeCreationError).cause).toBe(genericError);
    }
  });

  it("should wrap non-Error throws in GradeCreationError", () => {
    const errorString = "¡Error inesperado como string!";
    vi.spyOn(Id, "create").mockImplementationOnce(() => {
      throw errorString;
    });

    expect(() => Grade.create(validProps)).toThrow(GradeCreationError);

    try {
      Grade.create(validProps);
    } catch (error) {
      expect(error).toBeInstanceOf(GradeCreationError);
      expect((error as GradeCreationError).cause).toBeInstanceOf(Error);
      expect(((error as GradeCreationError).cause as Error).message).toBe(
        errorString,
      );
    }
  });
});
