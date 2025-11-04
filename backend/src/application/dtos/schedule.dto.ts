import { type DayOfWeek } from "@/domain/enums/index.js";

/**
 * DTO (Data Transfer Object) for a single student schedule entry.
 */
export interface StudentScheduleEntryDto {
  /** Name of the course */
  courseName: string;

  /** Type of group: "Teoria" or "Lab" */
  groupType: "Teoria" | "Lab";

  /** Letter of the group (e.g., "A", "B") */
  groupLetter: string;

  /** Day of the week */
  day: DayOfWeek;

  /** Start time in "HH:MM" format */
  startTime: string;

  /** End time in "HH:MM" format */
  endTime: string;

  /** Classroom name */
  classroomName: string;

  /** Professor's full name */
  professorName: string;
}
