import { describe, it, expect } from "vitest";
import {
  Course,
  type CourseCreateProps,
} from "@/domain/entities/course.entity.js";
import { CourseType } from "@/domain/enums/index.js";
import { Id, CourseCode, Credits } from "@/domain/value-objects/index.js";
import {
  InvalidUuidError,
  InvalidCourseCodeError,
  InvalidCreditsError,
  InvalidCourseNameError,
  CourseCreationError,
} from "@/domain/errors/index.js";

describe("Domain > Entity: Course (Catalog)", () => {
  const validProps: CourseCreateProps = {
    id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    code: "11701101",
    name: "Razonamiento Lógico Matemático",
    credits: 3,
    type: CourseType.THEORY,
  };

  it("should create a valid Course instance", () => {
    const course = Course.create(validProps);

    expect(course).toBeInstanceOf(Course);
    expect(course.id).toBeInstanceOf(Id);
    expect(course.code).toBeInstanceOf(CourseCode);
    expect(course.credits).toBeInstanceOf(Credits);
    expect(course.name).toBe("Razonamiento Lógico Matemático");
    expect(course.type).toBe(CourseType.THEORY);
  });

  it("should throw InvalidUuidError if ID is invalid", () => {
    const invalidProps = { ...validProps, id: "123" };
    expect(() => Course.create(invalidProps)).toThrow(InvalidUuidError);
  });

  it("should throw InvalidCourseCodeError if code is invalid", () => {
    const invalidProps = { ...validProps, code: "ABC" };
    expect(() => Course.create(invalidProps)).toThrow(InvalidCourseCodeError);
  });

  it("should throw InvalidCreditsError if credits are zero", () => {
    const invalidProps = { ...validProps, credits: 0 };
    expect(() => Course.create(invalidProps)).toThrow(InvalidCreditsError);
  });

  it("should throw InvalidCourseNameError if name is too short", () => {
    const invalidProps = { ...validProps, name: "Abc" };
    expect(() => Course.create(invalidProps)).toThrow(InvalidCourseNameError);
  });
  it("should throw CourseCreationError if type is invalid", () => {
    const invalidProps = { ...validProps, type: "CURSO_INVENTADO" as any };

    expect(() => Course.create(invalidProps)).toThrow(CourseCreationError);

    try {
      Course.create(invalidProps);
      throw new Error("El test debió fallar");
    } catch (error) {
      expect(error).toBeInstanceOf(CourseCreationError);
      expect(error).toBeInstanceOf(Error);
    }
  });

  it("should catch a DomainError and re-throw it", () => {
    const invalidProps = { ...validProps, id: "123" };

    expect(() => Course.create(invalidProps)).toThrow(InvalidUuidError);
  });

  it("should catch an unexpected Error and wrap it in CourseCreationError", () => {
    const unexpectedErrorMessage = "Error inesperado de base de datos";

    vi.spyOn(Id, "create").mockImplementationOnce(() => {
      throw new Error(unexpectedErrorMessage);
    });

    expect(() => Course.create(validProps)).toThrow(CourseCreationError);

    try {
      Course.create(validProps);
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect(error).toBe(unexpectedErrorMessage);
    }
  });

  it("should catch a non-Error throw (string) and wrap it in CourseCreationError", () => {
    const unexpectedErrorString = "algo falló";

    vi.spyOn(Id, "create").mockImplementationOnce(() => {
      throw unexpectedErrorString;
    });

    expect(() => Course.create(validProps)).toThrow(CourseCreationError);

    try {
      Course.create(validProps);
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect(error).toBe(unexpectedErrorString);
    }
  });
});
