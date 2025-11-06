/**
 * @file Use Case: Create a new room reservation for a teacher.
 * Implements business rules for reservation limits and window.
 */
import {
  Id,
  AcademicSemester,
  TimeOfDay,
  TimeSlot,
  ReservationDate,
} from "@/domain/value-objects/index.js";
import { RoomReservation } from "@/domain/entities/room-reservation.entity.js";
import { DayOfWeek, ReservationStatus } from "@/domain/enums/index.js";
import {
  ReservationConflictError,
  ReservationLimitError,
  ReservationCreationError,
} from "@/domain/errors/index.js";
import { type CreateReservationDto } from "@/application/dtos/reservation.dto.js";
import { v4 as uuidv4 } from "uuid";
import { type IUnitOfWork } from "@/application/contracts/i-unit-of-work.js";

const MAX_RESERVATIONS_PER_WEEK = 2;

function getWeekRange(date: Date): { start: Date; end: Date } {
  const d = new Date(date.getTime());
  d.setUTCHours(0, 0, 0, 0);
  const dayOfWeek = d.getUTCDay();
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

  const start = new Date(d.setUTCDate(d.getUTCDate() + diffToMonday));

  const end = new Date(start.getTime());
  end.setUTCDate(start.getUTCDate() + 6); // Añadir 6 días para obtener Domingo
  end.setUTCHours(23, 59, 59, 999); // Fin del Domingo

  return { start, end };
}

type UtcDayIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6;
const DAY_OF_WEEK_MAP: Record<UtcDayIndex, DayOfWeek> = {
  0: DayOfWeek.SUNDAY,
  1: DayOfWeek.MONDAY,
  2: DayOfWeek.TUESDAY,
  3: DayOfWeek.WEDNESDAY,
  4: DayOfWeek.THURSDAY,
  5: DayOfWeek.FRIDAY,
  6: DayOfWeek.SATURDAY,
};

export class CreateRoomReservationUseCase {
  constructor(private readonly uow: IUnitOfWork) { }

  public async execute(
    input: CreateReservationDto,
    professorId: string,
  ): Promise<RoomReservation> {
    const profIdVO = Id.create(professorId);
    const classroomIdVO = Id.create(input.classroomId);
    const semesterVO = AcademicSemester.create(input.semester);

    const reservationDateVO = ReservationDate.create(input.date);
    const reservationDate = reservationDateVO.value;

    const startTimeVO = TimeOfDay.create(input.startTime);
    const endTimeVO = TimeOfDay.create(input.endTime);

    // Weekly Limit (2 per week)
    const { start: weekStart, end: weekEnd } = getWeekRange(reservationDate);

    const utcDayIndex = reservationDate.getUTCDay() as UtcDayIndex;
    const dayOfWeek = DAY_OF_WEEK_MAP[utcDayIndex];

    if (!dayOfWeek) {
      throw new ReservationCreationError(
        new Error(`Failed to map UTC day index ${utcDayIndex} to DayOfWeek.`),
      );
    }

    const comparisonTimeSlot = TimeSlot.create({
      day: dayOfWeek,
      startTime: input.startTime,
      endTime: input.endTime,
    });

    return this.uow.execute(async (repos) => {
      // Contar reservas existentes
      const weeklyCount = await repos.roomReservation.countByProfessorAndDateRange(
        profIdVO,
        weekStart,
        weekEnd,
      );

      if (weeklyCount >= MAX_RESERVATIONS_PER_WEEK) {
        throw new ReservationLimitError(MAX_RESERVATIONS_PER_WEEK);
      }

      // Conflicto con Horarios Fijos del Aula
      const fixedSchedules =
        await repos.classSchedule.findSchedulesByClassroomAndSemester(
          classroomIdVO,
          semesterVO,
        );
      const fixedConflict = fixedSchedules.find((schedule) =>
        schedule.overlapsWith(comparisonTimeSlot),
      );
      if (fixedConflict) {
        throw new ReservationConflictError(
          "Classroom is already occupied by a fixed schedule at this time.",
        );
      }

      // Conflicto con Otras Reservas en el Aula
      const overlappingReservations =
        await repos.roomReservation.findOverlappingReservations(
          classroomIdVO,
          semesterVO,
          reservationDate,
          startTimeVO,
          endTimeVO,
        );
      if (overlappingReservations.length > 0) {
        throw new ReservationConflictError(
          "Classroom is already reserved by another user at this date and time.",
        );
      }

      //  Conflicto con Horario Fijo (Teoría) del Profesor
      const profTheoryGroups =
        await repos.theoryGroup.findByProfessorAndSemester(
          profIdVO,
          semesterVO,
        );
      for (const group of profTheoryGroups) {
        const profSchedules = await repos.classSchedule.findByTheoryGroup(
          group.id,
        );
        if (profSchedules.some((s) => s.overlapsWith(comparisonTimeSlot))) {
          throw new ReservationConflictError(
            "Professor has a fixed THEORY class at this time.",
          );
        }
      }

      // Conflicto con Horario Fijo (Lab) del Profesor
      const profLabGroups = await repos.labGroup.findByProfessor(profIdVO);
      for (const group of profLabGroups) {
        const profSchedules = await repos.classSchedule.findByLabGroup(
          group.id,
        );
        if (
          profSchedules
            .filter((s) => s.semester.equals(semesterVO))
            .some((s) => s.overlapsWith(comparisonTimeSlot))
        ) {
          throw new ReservationConflictError(
            "Professor has a fixed LAB class at this time.",
          );
        }
      }

      // Conflicto con Otras Reservas del Profesor
      const profReservations =
        await repos.roomReservation.findByProfessorAndSemester(
          profIdVO,
          semesterVO,
        );
      if (
        profReservations.some((r) =>
          r.overlapsWith(reservationDate, startTimeVO, endTimeVO),
        )
      ) {
        throw new ReservationConflictError(
          "Professor already has another reservation at this date and time.",
        );
      }

      const reservation = RoomReservation.create({
        id: uuidv4(),
        classroomId: input.classroomId,
        professorId: professorId,
        semester: input.semester,
        date: input.date,
        startTime: input.startTime,
        endTime: input.endTime,
        status: ReservationStatus.RESERVED,
        notes: input.notes,
      });

      await repos.roomReservation.save(reservation);
      return reservation;
    });
  }
}
