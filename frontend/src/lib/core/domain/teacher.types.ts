import type { AttendanceStatus, ClassType, DayOfWeek, GradeType } from './enums';

/**
 * Represents a teacher’s course group for a given semester.
 */
export interface TeacherGroup {
  groupId: string;
  courseName: string;
  groupType: ClassType;
  groupLetter: string;
}

/**
 * Represents a scheduled teaching session for a semester.
 */
export interface TeacherScheduleEntry {
  courseName: string;
  groupType: 'Teoria' | 'Labo' | 'Reserva';
  groupLetter: string;
  day: DayOfWeek;
  startTime: string;
  endTime: string;
  classroomName: string;
  date?: string;
}

/**
 * Represents a student entry in a group's roster.
 */
export interface StudentRosterEntry {
  enrollmentId: string;
  studentCode: string;
  name: string;
  surname: string;
  email: string;
}

/**
 * Represents a single grade entry for a student.
 */
export interface StudentGradeEntry {
  type: GradeType;
  score: number | null;
}

/**
 * Represents a student in a group roster including grade details.
 */
export interface StudentRosterWithGrades extends StudentRosterEntry {
  grades: StudentGradeEntry[];
}

/**
 * Represents a single attendance record.
 */
export interface AttendanceRecord {
  enrollmentId: string;
  status: AttendanceStatus;
}

/**
 * Request payload for submitting attendance.
 */
export interface TakeAttendanceInput {
  classType: ClassType;
  groupId: string;
  date: string; // ISO date string (e.g., "2025-11-03")
  records: AttendanceRecord[];
}

/**
 * Represents a single grade update.
 */
export interface BulkGradeSaveEntry {
  enrollmentId: string;
  type: GradeType;
  score: number;
}

/**
 * Request payload for saving multiple grades at once.
 */
export interface SaveBulkGradesInput {
  classType: ClassType;
  groupId: string;
  entries: BulkGradeSaveEntry[];
}

/**
 * Request payload for creating a room reservation.
 */
export interface CreateReservationInput {
  classroomId: string;
  semester: string;
  date: string; // "YYYY-MM-DD"
  startTime: string; // "HH:MM"
  endTime: string; // "HH:MM"
  notes?: string;
}

/**
 * Expected response structure after successfully creating a reservation.
 */
export interface CreatedReservationResponse {
  id: string;
  classroomId: string;
  professorId: string;
  semester: string;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  notes?: string;
}

/**
 * Represents an available classroom to select.
 */
export interface AvailableClassroom {
  id: string;
  name: string; // Ej: "Salón 1", "Aula 205"
}
