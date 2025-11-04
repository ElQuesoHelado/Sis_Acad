import { describe, it, expect, vi, afterEach } from "vitest";
import {
  Attendance,
  type AttendanceCreateProps,
} from "@/domain/entities/attendance.entity.js";
import { AttendanceStatus, ClassType } from "@/domain/enums/index.js";
import { Id } from "@/domain/value-objects/index.js";
import {
  InvalidUuidError,
  AttendanceCreationError,
  InvalidAttendanceStatusError,
  FutureAttendanceDateError,
  InvalidClassTypeError,
} from "@/domain/errors/index.js";

describe("Domain > Entity: Attendance", () => {
  const validProps: AttendanceCreateProps = {
    id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    enrollmentId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22",
    date: new Date("2024-10-20"),
    status: AttendanceStatus.PRESENT,
    classType: ClassType.THEORY,
  };

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should create a valid Attendance instance", () => {
    const attendance = Attendance.create(validProps);

    expect(attendance).toBeInstanceOf(Attendance);
    expect(attendance.id).toBeInstanceOf(Id);
    expect(attendance.enrollmentId).toBeInstanceOf(Id);
    expect(attendance.status).toBe(AttendanceStatus.PRESENT);
    expect(attendance.classType).toBe(ClassType.THEORY);
  });

  it("should normalize the date to remove time", () => {
    const dateWithTime = new Date("2024-10-20T14:30:00");
    const attendance = Attendance.create({ ...validProps, date: dateWithTime });

    const expectedTimestamp = Date.UTC(2024, 9, 20);
    const expectedDate = new Date(expectedTimestamp);

    expect(attendance.date.getTime()).toBe(expectedDate.getTime());

    expect(attendance.date.toISOString()).toBe("2024-10-20T00:00:00.000Z");
  });

  it("should throw InvalidUuidError if enrollmentId is invalid", () => {
    const invalidProps = { ...validProps, enrollmentId: "123" };
    expect(() => Attendance.create(invalidProps)).toThrow(InvalidUuidError);
  });

  it("should throw InvalidAttendanceStatusError if status is invalid", () => {
    const invalidProps = { ...validProps, status: "TARDE" as any };
    expect(() => Attendance.create(invalidProps)).toThrow(
      InvalidAttendanceStatusError,
    );
  });

  it("should throw InvalidClassTypeError if classType is invalid", () => {
    const invalidProps = { ...validProps, classType: "REPASO" as any };
    expect(() => Attendance.create(invalidProps)).toThrow(
      InvalidClassTypeError,
    );
  });

  it("should throw FutureAttendanceDateError if date is in the future", () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 1);
    const invalidProps = { ...validProps, date: futureDate };

    expect(() => Attendance.create(invalidProps)).toThrow(
      FutureAttendanceDateError,
    );
  });

  it("should correctly update the status", () => {
    const attendance = Attendance.create(validProps);
    expect(attendance.status).toBe(AttendanceStatus.PRESENT);

    attendance.updateStatus(AttendanceStatus.ABSENT);
    expect(attendance.status).toBe(AttendanceStatus.ABSENT);
  });

  it("should throw when updating with invalid status", () => {
    const attendance = Attendance.create(validProps);
    expect(() => attendance.updateStatus("EXCUSADO" as any)).toThrow(
      InvalidAttendanceStatusError,
    );
  });

  it("should wrap generic Error errors in AttendanceCreationError", () => {
    const genericError = new Error("Error inesperado");
    vi.spyOn(Id, "create").mockImplementationOnce(() => {
      throw genericError;
    });

    expect(() => Attendance.create(validProps)).toThrow(
      AttendanceCreationError,
    );
  });
});
