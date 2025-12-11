import { type DayOfWeek } from "@/domain/enums/index.js";

export interface TeacherScheduleEntryDto {
  courseName: string;
  groupType: "Teoria" | "Labo" | "Reserva"; 
  groupLetter: string;
  day: DayOfWeek;
  startTime: string;
  endTime: string;
  classroomName: string;
  date?: string;
}
