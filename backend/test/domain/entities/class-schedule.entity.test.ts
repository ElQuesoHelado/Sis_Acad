/**
 * @file test/domain/entities/class-schedule.entity.test.ts
 * @fileoverview Unit tests for the ClassSchedule entity.
 */

import { describe, it, expect, vi, afterEach } from "vitest";

import {
  ClassSchedule,
  type ClassScheduleCreateProps,
} from "@/domain/entities/class-schedule.entity.js";
import { Id, TimeSlot } from "@/domain/value-objects/index.js";
import { DayOfWeek } from "@/domain/enums/index.js";
import {
  ClassScheduleCreationError,
  ScheduleConflictError,
  ScheduleAssignmentError,
  InvalidUuidError,
  InvalidTimeSlotError,
  InvalidSemesterError,
} from "@/domain/errors/index.js";
import type { TimeSlotCreateProps } from "@/domain/value-objects/time-slot.vo.js";

describe("Domain > Entity: ClassSchedule", () => {
  const validCourseId = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33";
  const validLabGroupId = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44";

  const validTimeSlotProps: TimeSlotCreateProps = {
    day: DayOfWeek.MONDAY,
    startTime: "10:00",
    endTime: "12:00",
  };

  const baseProps: ClassScheduleCreateProps = {
    id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    classroomId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22",
    timeSlot: validTimeSlotProps,
    semester: "2024-I",
  };

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should create a valid schedule for a theory course", () => {
    const props = { ...baseProps, courseId: validCourseId, labGroupId: null };
    const schedule = ClassSchedule.create(props);
    expect(schedule.courseId?.value).toBe(validCourseId);
    expect(schedule.labGroupId).toBeNull();
  });

  it("should create a valid schedule for a lab group", () => {
    const props = { ...baseProps, courseId: null, labGroupId: validLabGroupId };
    const schedule = ClassSchedule.create(props);
    expect(schedule.labGroupId?.value).toBe(validLabGroupId);
    expect(schedule.courseId).toBeNull();
  });

  it("should throw InvalidUuidError if classroomId is invalid", () => {
    const invalidProps = {
      ...baseProps,
      classroomId: "123",
      courseId: validCourseId,
    };
    expect(() => ClassSchedule.create(invalidProps)).toThrow(InvalidUuidError);
  });

  it("should throw InvalidTimeSlotError if timeSlot is invalid", () => {
    const invalidProps = {
      ...baseProps,
      courseId: validCourseId,
      timeSlot: { ...validTimeSlotProps, startTime: "14:00", endTime: "12:00" },
    };
    expect(() => ClassSchedule.create(invalidProps)).toThrow(
      InvalidTimeSlotError,
    );
  });

  it("should throw InvalidSemesterError if semester is invalid", () => {
    const invalidProps = {
      ...baseProps,
      courseId: validCourseId,
      semester: "2024-III",
    };
    expect(() => ClassSchedule.create(invalidProps)).toThrow(
      InvalidSemesterError,
    );
  });

  it("should throw ScheduleConflictError if both courseId and labGroupId are provided", () => {
    const invalidProps = {
      ...baseProps,
      courseId: validCourseId,
      labGroupId: validLabGroupId,
    };
    expect(() => ClassSchedule.create(invalidProps)).toThrow(
      ScheduleConflictError,
    );
    expect(() => ClassSchedule.create(invalidProps)).toThrow(
      "Schedule cannot belong to both a course and a lab group.",
    );
  });

  it("should throw ScheduleAssignmentError if neither courseId nor labGroupId are provided", () => {
    const invalidProps = { ...baseProps, courseId: null, labGroupId: null };
    expect(() => ClassSchedule.create(invalidProps)).toThrow(
      ScheduleAssignmentError,
    );
    expect(() => ClassSchedule.create(invalidProps)).toThrow(
      "Schedule must belong to either a course or a lab group.",
    );
  });

  it("should correctly check for overlaps", () => {
    const schedule = ClassSchedule.create({
      ...baseProps,
      courseId: validCourseId,
    });

    const overlappingSlot = TimeSlot.create({
      day: DayOfWeek.MONDAY,
      startTime: "11:00",
      endTime: "13:00",
    });
    const nonOverlappingSlot = TimeSlot.create({
      day: DayOfWeek.MONDAY,
      startTime: "13:00",
      endTime: "15:00",
    });
    const nonOverlappingDay = TimeSlot.create({
      day: DayOfWeek.TUESDAY,
      startTime: "11:00",
      endTime: "13:00",
    });

    expect(schedule.overlapsWith(overlappingSlot)).toBe(true);
    expect(schedule.overlapsWith(nonOverlappingSlot)).toBe(false);
    expect(schedule.overlapsWith(nonOverlappingDay)).toBe(false);
  });

  it("should re-throw DomainErrors directly if caught", () => {
    const knownError = new InvalidUuidError("ID inválido");
    vi.spyOn(Id, "create").mockImplementationOnce(() => {
      throw knownError;
    });
    expect(() =>
      ClassSchedule.create({ ...baseProps, courseId: validCourseId }),
    ).toThrow(InvalidUuidError);
  });

  it("should wrap non-Error throws in ClassScheduleCreationError", () => {
    const errorString = "¡Error inesperado como string!";
    vi.spyOn(Id, "create").mockImplementationOnce(() => {
      throw errorString;
    });

    expect(() =>
      ClassSchedule.create({ ...baseProps, courseId: validCourseId }),
    ).toThrow(ClassScheduleCreationError);
    try {
      ClassSchedule.create({ ...baseProps, courseId: validCourseId });
    } catch (error) {
      expect(error as ClassScheduleCreationError).toBe(errorString);
    }
  });
});
