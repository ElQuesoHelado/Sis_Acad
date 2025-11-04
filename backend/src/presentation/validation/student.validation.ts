import { z } from "zod";
import { validate } from "../middlewares/validation.middleware.js";

/**
 * Reusable parameter schemas
 */

// Validates that :semester is in the format "YYYY-I" or "YYYY-II"
const semesterParamsSchema = z.object({
  semester: z
    .string()
    .regex(
      /^\d{4}-(I|II)$/,
      "Invalid semester format. Must be YYYY-I or YYYY-II",
    ),
});

// Validates that :enrollmentId is a UUID
const enrollmentParamsSchema = z.object({
  enrollmentId: z.uuid("Invalid enrollmentId format. Must be a UUID."),
});

/**
 * Request body schemas
 */

// Validates the body for enrolling in a single lab
const enrollInLabGroupBodySchema = z.object({
  enrollmentId: z.uuid("enrollmentId must be a valid UUID."),
  labGroupId: z.uuid("labGroupId must be a valid UUID."),
});

// Validates the body for bulk lab enrollments
const enrollInLabGroupsBodySchema = z.object({
  selections: z
    .array(
      z.object({
        enrollmentId: z.uuid(),
        labGroupId: z.uuid(),
      }),
    )
    .min(1, "'selections' array cannot be empty."),
});

/**
 * Exported validation middlewares
 */

// GET /student/courses/:semester
export const validateGetStudentCourses = validate(
  z.object({ params: semesterParamsSchema }),
);

// GET /student/grades/:semester
export const validateGetStudentGrades = validate(
  z.object({ params: semesterParamsSchema }),
);

// GET /student/schedule/:semester
export const validateGetStudentSchedule = validate(
  z.object({ params: semesterParamsSchema }),
);

// GET /student/enrollment/:enrollmentId/available-labs
export const validateGetAvailableLabGroups = validate(
  z.object({ params: enrollmentParamsSchema }),
);

// POST /student/enroll-labs
export const validateEnrollInLabGroups = validate(
  z.object({ body: enrollInLabGroupsBodySchema }),
);

// PATCH /student/enroll-lab
export const validateEnrollInLabGroup = validate(
  z.object({ body: enrollInLabGroupBodySchema }),
);
