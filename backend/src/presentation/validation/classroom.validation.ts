import { z } from "zod";

export const getClassroomScheduleSchema = z.object({
  params: z.object({
    classroomId: z.string().uuid("Classroom ID must be a valid UUID").optional(),
    id: z.string().uuid("Classroom ID must be a valid UUID").optional(),
  }).refine((data) => data.classroomId || data.id, {
    message: "Either classroomId or id parameter must be provided and must be a valid UUID"
  }),
  query: z.object({
    semester: z.string().regex(/^\d{4}-(I|II)$/, {
      message: "Semester must be in format YYYY-I or YYYY-II (e.g., 2024-I, 2025-II)"
    }),
  }),
});