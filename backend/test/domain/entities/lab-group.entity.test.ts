import { describe, it, expect } from "vitest";

import {
  LabGroup,
  type LabGroupCreateProps,
} from "@/domain/entities/lab-group.entity.js";
import { Id, GroupLetter } from "@/domain/value-objects/index.js";
import {
  InvalidUuidError,
  LabGroupCreationError,
  LabGroupFullError,
  InvalidGroupLetterError,
} from "@/domain/errors/index.js";

describe("Domain > Entity: LabGroup", () => {
  const validProps: LabGroupCreateProps = {
    id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    courseId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22",
    professorId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33",
    groupLetter: "A",
    capacity: 20,
    currentEnrollment: 5,
  };

  it("should create a valid LabGroup instance with correct VOs", () => {
    const group = LabGroup.create(validProps);

    expect(group).toBeInstanceOf(LabGroup);
    expect(group.id).toBeInstanceOf(Id);
    expect(group.courseId).toBeInstanceOf(Id);
    expect(group.professorId).toBeInstanceOf(Id);
    expect(group.groupLetter).toBeInstanceOf(GroupLetter);
    expect(group.groupLetter.value).toBe("A");
    expect(group.capacity).toBe(20);
    expect(group.currentEnrollment).toBe(5);
    expect(group.getDisplayName()).toBe("Grupo A");
  });

  it("should normalize (trim) the groupLetter via the VO factory", () => {
    const group = LabGroup.create({ ...validProps, groupLetter: "  B  " });
    expect(group.groupLetter.value).toBe("B");
    expect(group.getDisplayName()).toBe("Grupo B");
  });

  it("should throw InvalidUuidError if courseId is invalid", () => {
    const invalidProps = { ...validProps, courseId: "123" };
    expect(() => LabGroup.create(invalidProps)).toThrow(InvalidUuidError);
  });

  it("should throw LabGroupCreationError if capacity is invalid (zero)", () => {
    const invalidProps = { ...validProps, capacity: 0 };
    expect(() => LabGroup.create(invalidProps)).toThrow(LabGroupCreationError);
  });

  it("should throw InvalidGroupLetterError if groupLetter is invalid (number)", () => {
    const invalidProps = { ...validProps, groupLetter: "1" as any };
    expect(() => LabGroup.create(invalidProps)).toThrow(
      InvalidGroupLetterError,
    );
  });

  it("should throw InvalidGroupLetterError if groupLetter is invalid (multi-char)", () => {
    const invalidProps = { ...validProps, groupLetter: "AB" };
    expect(() => LabGroup.create(invalidProps)).toThrow(
      InvalidGroupLetterError,
    );
  });

  it("should throw InvalidGroupLetterError if groupLetter is invalid (lowercase)", () => {
    const invalidProps = { ...validProps, groupLetter: "a" };
    expect(() => LabGroup.create(invalidProps)).toThrow(
      InvalidGroupLetterError,
    );
  });

  it("should throw LabGroupCreationError if enrollment exceeds capacity", () => {
    const invalidProps = { ...validProps, currentEnrollment: 21, capacity: 20 };
    expect(() => LabGroup.create(invalidProps)).toThrow(LabGroupCreationError);
  });

  it("should throw LabGroupCreationError if enrollment exceeds capacity", () => {
    const invalidProps = { ...validProps, currentEnrollment: 21, capacity: 20 };
    expect(() => LabGroup.create(invalidProps)).toThrow(LabGroupCreationError);
  });

  it("should wrap non-DomainError errors in LabGroupCreationError", () => {
    const genericError = new Error("¡Error inesperado de base de datos!");
    vi.spyOn(Id, "create").mockImplementationOnce(() => {
      throw genericError;
    });

    expect(() => LabGroup.create(validProps)).toThrow(LabGroupCreationError);

    try {
      LabGroup.create(validProps);
    } catch (error) {
      expect(error).toBeInstanceOf(LabGroupCreationError);
      expect((error as LabGroupCreationError).cause).toBe(genericError);
    }
  });
  it("should re-throw DomainErrors directly if caught", () => {
    vi.spyOn(Id, "create").mockImplementationOnce(() => {
      throw new InvalidUuidError("ID de prueba inválido");
    });

    expect(() => LabGroup.create(validProps)).toThrow(InvalidUuidError);
    expect(() => LabGroup.create(validProps)).not.toThrow(
      LabGroupCreationError,
    );
  });
  it("should wrap non-Error throws in LabGroupCreationError", () => {
    const errorString = "¡Error inesperado como string!";
    vi.spyOn(Id, "create").mockImplementationOnce(() => {
      throw errorString;
    });

    expect(() => LabGroup.create(validProps)).toThrow(LabGroupCreationError);

    try {
      LabGroup.create(validProps);
    } catch (error) {
      expect(error).toBeInstanceOf(LabGroupCreationError);
      expect((error as LabGroupCreationError).cause).toBeInstanceOf(Error);
      expect(((error as LabGroupCreationError).cause as Error).message).toBe(
        errorString,
      );
    }
  });
  it("should default currentEnrollment to 0 if not provided", () => {
    const props = { ...validProps };

    delete props.currentEnrollment;

    const group = LabGroup.create(props);

    expect(group.currentEnrollment).toBe(0);
  });

  describe("Enrollment Logic", () => {
    it("should correctly report isFull()", () => {
      const fullGroup = LabGroup.create({
        ...validProps,
        capacity: 20,
        currentEnrollment: 20,
      });
      const notFullGroup = LabGroup.create({
        ...validProps,
        capacity: 20,
        currentEnrollment: 19,
      });

      expect(fullGroup.isFull()).toBe(true);
      expect(notFullGroup.isFull()).toBe(false);
    });

    it("should increment enrollment correctly", () => {
      const group = LabGroup.create({ ...validProps, currentEnrollment: 18 });
      group.incrementEnrollment();
      expect(group.currentEnrollment).toBe(19);
      group.incrementEnrollment();
      expect(group.currentEnrollment).toBe(20);
    });

    it("should throw LabGroupFullError if incrementing when full", () => {
      const group = LabGroup.create({ ...validProps, currentEnrollment: 20 });
      expect(group.isFull()).toBe(true);
      expect(() => group.incrementEnrollment()).toThrow(LabGroupFullError);
    });

    it("should decrement enrollment correctly when above zero", () => {
      const group = LabGroup.create({ ...validProps, currentEnrollment: 5 });
      group.decrementEnrollment();
      expect(group.currentEnrollment).toBe(4);
    });

    it("should not decrement enrollment below zero", () => {
      const group = LabGroup.create({ ...validProps, currentEnrollment: 0 });
      group.decrementEnrollment();
      expect(group.currentEnrollment).toBe(0);
    });
  });
});
