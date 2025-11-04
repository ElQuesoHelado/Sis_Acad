import type { AttendanceStatus, ClassType, DayOfWeek, GradeType } from './enums';

/**
 * Represents a teacher’s course group for a given semester.
 * Returned by GET /api/teacher/groups/{semester}.
 */
export interface TeacherGroup {
	groupId: string;
	courseName: string;
	groupType: ClassType;
	groupLetter: string;
}

/**
 * Represents a scheduled teaching session for a semester.
 * Returned by GET /api/teacher/schedule/{semester}.
 */
export interface TeacherScheduleEntry {
	courseName: string;
	groupType: 'Teoria' | 'Labo';
	groupLetter: string;
	day: DayOfWeek;
	startTime: string; // "HH:MM"
	endTime: string; // "HH:MM"
	classroomName: string;
}

/**
 * Represents a student entry in a group's roster.
 * Returned by GET /api/teacher/group/{groupId}/roster.
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
 * Returned by GET /api/teacher/group/{groupId}/roster-with-grades.
 */
export interface StudentRosterWithGrades extends StudentRosterEntry {
	grades: StudentGradeEntry[];
}

/**
 * Represents a single attendance record (used in request payloads).
 */
export interface AttendanceRecord {
	enrollmentId: string;
	status: AttendanceStatus;
}

/**
 * Request payload for submitting attendance.
 * Used in POST /api/teacher/attendance/take.
 */
export interface TakeAttendanceInput {
	classType: ClassType;
	groupId: string;
	date: string; // ISO date string (e.g., "2025-11-03")
	records: AttendanceRecord[];
}

/**
 * Represents a single grade update (used in request payloads).
 */
export interface BulkGradeSaveEntry {
	enrollmentId: string;
	type: GradeType;
	score: number;
}

/**
 * Request payload for saving multiple grades at once.
 * Used in POST /api/teacher/grades/save-bulk.
 */
export interface SaveBulkGradesInput {
	classType: ClassType;
	groupId: string;
	entries: BulkGradeSaveEntry[];
}
