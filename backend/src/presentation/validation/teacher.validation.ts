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
