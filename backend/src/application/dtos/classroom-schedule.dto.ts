import { DayOfWeek } from "@/domain/enums/day-of-week.enum.js";

export interface ClassroomScheduleEntryDto {
  title: string;          // Course name or "Reservado"
  type: "FIXED_CLASS" | "RESERVATION";
  day: DayOfWeek;
  startTime: string;
  endTime: string;
  professorName: string;
  date?: string;
}
