/**
 * @file DTO for the teacher's schedule.
 */
import { type DayOfWeek } from "@/domain/enums/index.js";

export interface TeacherScheduleEntryDto {
  courseName: string;
  groupType: "Teoria" | "Labo";
  groupLetter: string;
  day: DayOfWeek;
  startTime: string; // "HH:MM"
  endTime: string; // "HH:MM"
  classroomName: string;
}
