import { describe, it, expect } from "vitest";
import { AcademicSemester } from "@/domain/value-objects/academic-semester.vo.js";
import { InvalidSemesterError } from "@/domain/errors/index.js";

describe("Domain > Value Object: AcademicSemester", () => {
  describe("Factory: create()", () => {
    it('should create a valid instance for "2025-I"', () => {
      const semester = AcademicSemester.create("2025-I");
      expect(semester).toBeInstanceOf(AcademicSemester);
      expect(semester.value).toBe("2025-I");
    });

    it('should create a valid instance for "2024-II"', () => {
      const semester = AcademicSemester.create("2024-II");
      expect(semester.value).toBe("2024-II");
    });

    it("should normalize (trim) the semester", () => {
      const semester = AcademicSemester.create("  2023-I  ");
      expect(semester.value).toBe("2023-I");
    });

    it('should throw InvalidSemesterError for format "2025-1"', () => {
      expect(() => AcademicSemester.create("2025-1")).toThrow(
        InvalidSemesterError,
      );
    });

    it('should throw InvalidSemesterError for format "2025-III"', () => {
      expect(() => AcademicSemester.create("2025-III")).toThrow(
        InvalidSemesterError,
      );
    });

    it("should throw InvalidSemesterError for an empty string", () => {
      expect(() => AcademicSemester.create("")).toThrow(InvalidSemesterError);
    });

    it("should throw InvalidSemesterError for null input", () => {
      expect(() => AcademicSemester.create(null as any)).toThrow(
        InvalidSemesterError,
      );
    });
  });

  describe("Auxiliary Methods", () => {
    const semesterI = AcademicSemester.create("2025-I");
    const semesterII = AcademicSemester.create("2024-II");
    const semesterI_copy = AcademicSemester.create("2025-I");

    it("should correctly extract the year with getYear()", () => {
      expect(semesterI.getYear()).toBe(2025);
      expect(semesterII.getYear()).toBe(2024);
    });

    it("should correctly extract the period with getPeriod()", () => {
      expect(semesterI.getPeriod()).toBe("I");
      expect(semesterII.getPeriod()).toBe("II");
    });

    it("should correctly compare two equal VOs with equals()", () => {
      expect(semesterI.equals(semesterI_copy)).toBe(true);
    });

    it("should correctly compare two different VOs with equals()", () => {
      expect(semesterI.equals(semesterII)).toBe(false);
    });

    it("should return the primitive value using toString()", () => {
      expect(semesterI.toString()).toBe("2025-I");
    });
  });
});
