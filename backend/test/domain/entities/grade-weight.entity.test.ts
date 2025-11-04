import { describe, it, expect, vi } from "vitest";
import {
  GradeWeight,
  type GradeWeightCreateProps,
} from "@/domain/entities/grade-weight.entity.js";
import { GradeType } from "@/domain/enums/grade-type.enum.js";
import { Id, Percentage } from "@/domain/value-objects/index.js";
import {
  InvalidPercentageError,
  InvalidUuidError,
} from "@/domain/errors/index.js";

import {
  GradeWeightCreationError,
  InvalidGradeWeightSumError,
  InvalidGradeWeightTypeError,
} from "@/domain/errors/grade-weight.errors.js";

describe("Domain > Entity: GradeWeight", () => {
  const validProps: GradeWeightCreateProps = {
    id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    theoryGroupId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22",
    type: GradeType.PARTIAL_1,
    weight: 20,
  };

  it("should create a valid GradeWeight instance", () => {
    const gw = GradeWeight.create(validProps);
    expect(gw).toBeInstanceOf(GradeWeight);
    expect(gw.id).toBeInstanceOf(Id);
    expect(gw.weight).toBeInstanceOf(Percentage);
    expect(gw.weight.value).toBe(20);
    expect(gw.type).toBe(GradeType.PARTIAL_1);
  });

  it("should throw InvalidPercentageError if weight is over 100", () => {
    const invalidProps = { ...validProps, weight: 101 };
    expect(() => GradeWeight.create(invalidProps)).toThrow(
      InvalidPercentageError,
    );
  });

  it("should throw InvalidPercentageError if weight is negative", () => {
    const invalidProps = { ...validProps, weight: -10 };
    expect(() => GradeWeight.create(invalidProps)).toThrow(
      InvalidPercentageError,
    );
  });

  it("should throw InvalidGradeWeightTypeError if type is invalid", () => {
    const invalidProps = { ...validProps, type: "FINAL_EXAM" as any };
    expect(() => GradeWeight.create(invalidProps)).toThrow(
      InvalidGradeWeightTypeError,
    );
  });

  it("should re-throw DomainErrors (like InvalidUuidError)", () => {
    const invalidProps = { ...validProps, theoryGroupId: "123" };
    expect(() => GradeWeight.create(invalidProps)).toThrow(InvalidUuidError);
  });

  it("should wrap unknown errors in GradeWeightCreationError", () => {
    vi.spyOn(Id, "create").mockImplementationOnce(() => {
      throw new Error("Unexpected DB error");
    });
    expect(() => GradeWeight.create(validProps)).toThrow(
      GradeWeightCreationError,
    );
  });

  describe("Static: validateWeights", () => {
    it("should not throw if weights sum to 100", () => {
      const weights = [
        GradeWeight.create({
          ...validProps,
          type: GradeType.PARTIAL_1,
          weight: 20,
        }),
        GradeWeight.create({
          ...validProps,
          type: GradeType.PARTIAL_2,
          weight: 20,
        }),
        GradeWeight.create({
          ...validProps,
          type: GradeType.PARTIAL_3,
          weight: 20,
        }),
        GradeWeight.create({
          ...validProps,
          type: GradeType.CONTINUOUS_1,
          weight: 10,
        }),
        GradeWeight.create({
          ...validProps,
          type: GradeType.CONTINUOUS_2,
          weight: 10,
        }),
        GradeWeight.create({
          ...validProps,
          type: GradeType.CONTINUOUS_3,
          weight: 20,
        }),
      ];
      expect(() => GradeWeight.validateWeights(weights)).not.toThrow();
    });

    it("should throw InvalidGradeWeightSumError if weights do not sum to 100", () => {
      const weights = [
        GradeWeight.create({
          ...validProps,
          type: GradeType.PARTIAL_1,
          weight: 20,
        }),
        GradeWeight.create({
          ...validProps,
          type: GradeType.CONTINUOUS_1,
          weight: 20,
        }),
      ];
      expect(() => GradeWeight.validateWeights(weights)).toThrow(
        InvalidGradeWeightSumError,
      );
      expect(() => GradeWeight.validateWeights(weights)).toThrow(
        "Grade weights must sum to 100, but received 40.",
      );
    });

    it("should not throw if weights array is empty", () => {
      expect(() => GradeWeight.validateWeights([])).not.toThrow();
    });
  });
});
