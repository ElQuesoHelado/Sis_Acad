import { z } from "zod";
import {
  ClassType,
  AttendanceStatus,
  GradeType,
} from "@/domain/enums/index.js";
import { validate } from "../middlewares/validation.middleware.js";

const takeAttendanceBodySchema = z.object({
  classType: z.enum(ClassType),
  groupId: z.uuid(),
  date: z.iso.date(),
  records: z
    .array(
      z.object({
        enrollmentId: z.uuid(),
        status: z.enum(AttendanceStatus),
      }),
    )
    .min(1),
});

const semesterParamsSchema = z.object({
  semester: z.string().regex(/^\d{4}-(I|II)$/, "Invalid semester format"),
});

const rosterParamsSchema = z.object({
  groupId: z.uuid(),
});
const rosterQuerySchema = z.object({
  type: z.enum(ClassType),
});

const saveBulkGradesBodySchema = z.object({
  classType: z.enum(ClassType),
  groupId: z.uuid(),
  entries: z.array(
    z.object({
      enrollmentId: z.uuid(),
      type: z.enum(GradeType),
      score: z.number().min(0).max(20),
    }),
  ),
});

/**
 * Schema for validating the CreateReservation DTO.
 */
const createReservationBodySchema = z.object({
  classroomId: z.uuid("Invalid classroomId. Must be a UUID."),
  semester: z
    .string()
    .regex(
      /^\d{4}-(I|II)$/,
      "Invalid semester format. Must be YYYY-I or YYYY-II.",
    ),

  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date. Must be a YYYY-MM-DD string."),

  startTime: z
    .string()
    .regex(
      /^([01]\d|2[0-3]):([0-5]\d)$/,
      "Invalid startTime. Must be HH:MM format.",
    ),
  endTime: z
    .string()
    .regex(
      /^([01]\d|2[0-3]):([0-5]\d)$/,
      "Invalid endTime. Must be HH:MM format.",
    ),
  notes: z
    .string()
    .trim()
    .max(500, "Notes must be 500 characters or less.")
    .optional(),
});

export const validateGetTeacherGroups = validate(
  z.object({ params: semesterParamsSchema }),
);
export const validateGetTeacherSchedule = validate(
  z.object({ params: semesterParamsSchema }),
);
export const validateGetStudentRoster = validate(
  z.object({ params: rosterParamsSchema, query: rosterQuerySchema }),
);
export const validateTakeAttendance = validate(
  z.object({ body: takeAttendanceBodySchema }),
);
export const validateGetRosterWithGrades = validate(
  z.object({ params: rosterParamsSchema, query: rosterQuerySchema }),
);
export const validateSaveBulkGrades = validate(
  z.object({ body: saveBulkGradesBodySchema }),
);

export const validateCreateReservation = validate(
  z.object({ body: createReservationBodySchema }),
);
