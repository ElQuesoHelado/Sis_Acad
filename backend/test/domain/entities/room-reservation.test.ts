import { describe, it, expect, vi, afterEach } from "vitest";
import {
  RoomReservation,
  type RoomReservationCreateProps,
} from "@/domain/entities/room-reservation.entity.js";
import { ReservationStatus, DayOfWeek } from "@/domain/enums/index.js";
import { Id, TimeSlot } from "@/domain/value-objects/index.js";
import {
  InvalidUuidError,
  ReservationCreationError,
  InvalidReservationStatusError,
  InvalidTimeSlotError,
} from "@/domain/errors/index.js";

describe("Domain > Entity: RoomReservation", () => {
  const validTimeSlotProps = {
    day: DayOfWeek.MONDAY,
    startTime: "14:00",
    endTime: "16:00",
  };

  const validProps: RoomReservationCreateProps = {
    id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    classroomId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22",
    professorId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33",
    semester: "2024-I",
    timeSlot: validTimeSlotProps,
    status: ReservationStatus.RESERVED,
  };

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should create a valid RoomReservation instance", () => {
    const reservation = RoomReservation.create(validProps);

    expect(reservation).toBeInstanceOf(RoomReservation);
    expect(reservation.id).toBeInstanceOf(Id);
    expect(reservation.classroomId).toBeInstanceOf(Id);
    expect(reservation.professorId).toBeInstanceOf(Id);
    expect(reservation.timeSlot).toBeInstanceOf(TimeSlot);
    expect(reservation.status).toBe(ReservationStatus.RESERVED);
  });

  it("should throw InvalidUuidError if classroomId is invalid", () => {
    const invalidProps = { ...validProps, classroomId: "123" };
    expect(() => RoomReservation.create(invalidProps)).toThrow(
      InvalidUuidError,
    );
  });

  it("should throw InvalidTimeSlotError if timeSlot is invalid", () => {
    const invalidProps = {
      ...validProps,
      timeSlot: { ...validTimeSlotProps, startTime: "16:00", endTime: "14:00" },
    };
    expect(() => RoomReservation.create(invalidProps)).toThrow(
      InvalidTimeSlotError,
    );
  });

  it("should throw InvalidReservationStatusError if status is invalid", () => {
    const invalidProps = { ...validProps, status: "OCUPADO" as any };
    expect(() => RoomReservation.create(invalidProps)).toThrow(
      InvalidReservationStatusError,
    );
  });

  it("should correctly update status via cancel() and confirm()", () => {
    const reservation = RoomReservation.create(validProps);
    expect(reservation.status).toBe(ReservationStatus.RESERVED);

    reservation.cancel();
    expect(reservation.status).toBe(ReservationStatus.FREE);

    reservation.confirm();
    expect(reservation.status).toBe(ReservationStatus.RESERVED);
  });

  it("should correctly check for overlaps", () => {
    const reservation = RoomReservation.create(validProps);

    const overlappingSlot = TimeSlot.create({
      day: DayOfWeek.MONDAY,
      startTime: "15:00",
      endTime: "17:00",
    });
    const nonOverlappingSlot = TimeSlot.create({
      day: DayOfWeek.TUESDAY,
      startTime: "15:00",
      endTime: "17:00",
    });

    expect(reservation.overlapsWith(overlappingSlot)).toBe(true);
    expect(reservation.overlapsWith(nonOverlappingSlot)).toBe(false);
  });

  it("should NOT overlap if reservation status is FREE", () => {
    const reservation = RoomReservation.create({
      ...validProps,
      status: ReservationStatus.FREE,
    });

    const overlappingSlot = TimeSlot.create({
      day: DayOfWeek.MONDAY,
      startTime: "15:00",
      endTime: "17:00",
    });

    expect(reservation.overlapsWith(overlappingSlot)).toBe(false);
  });

  it("should wrap generic Error errors in ReservationCreationError", () => {
    const genericError = new Error("Error inesperado");
    vi.spyOn(Id, "create").mockImplementationOnce(() => {
      throw genericError;
    });

    expect(() => RoomReservation.create(validProps)).toThrow(
      ReservationCreationError,
    );
  });
});
