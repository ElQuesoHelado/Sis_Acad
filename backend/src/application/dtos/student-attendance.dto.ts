import { type AttendanceStatus, type ClassType } from "@/domain/enums/index.js";

export interface StudentAttendanceReportItemDto {
  date: string;        // "2024-05-20"
  status: AttendanceStatus;
  classType: ClassType;
  dayOfWeek: string;   // "LUNES"
  startTime: string;   // "10:00" - O "Horario Variable" si no cruza
  endTime: string;     // "12:00"
  classroomName: string; // "Aula 101"
}

export interface StudentAttendanceReportDto {
  enrollmentId: string;
  courseName: string;
  totalAssists: number;
  totalAbsences: number;
  percentage: number;
  details: StudentAttendanceReportItemDto[];
}
