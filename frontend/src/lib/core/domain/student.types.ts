import type { CourseStatus, DayOfWeek, GradeType, LabEnrollmentStatus } from './enums';

/**
 * Represents a student's enrollment in a course.
 */
export interface StudentCourse {
  enrollmentId: string;
  courseCode: string;
  courseName: string;
  credits: number;
  professorName: string;
  labStatus: LabEnrollmentStatus;
}

/**
 * Represents a single grade entry for a course.
 */
export interface GradeOutput {
  id: string;
  type: GradeType;
  typeName: string;
  score: number;
}

/**
 * Represents all grades and status for a student's course.
 */
export interface StudentCourseGrades {
	enrollmentId: string;
	courseName: string;
	professorName: string;
	grades: GradeOutput[];
	average: number | null;
	status: CourseStatus;
	groupStats: GroupGradeStats[];
	weights: GradeWeight[];
}

/**
 * Represents an entry in a student's schedule.
 */
export interface StudentScheduleEntry {
  courseName: string;
  groupType: 'Teoria' | 'Lab';
  groupLetter: string;
  day: DayOfWeek;
  startTime: string; // "HH:MM"
  endTime: string; // "HH:MM"
  classroomName: string;
  professorName: string;
}

/**
 * Represents an available laboratory group for enrollment.
 */
export interface AvailableLabGroup {
  id: string;
  groupLetter: string;
  capacity: number;
  currentEnrollment: number;
  isFull: boolean;
}

/**
 * Represents a selected lab group for enrollment input.
 */
export interface LabEnrollmentSelection {
  enrollmentId: string;
  labGroupId: string;
}

/**
 * Input for enrolling in multiple lab groups.
 */
export interface EnrollInLabGroupsInput {
  selections: LabEnrollmentSelection[];
}

/**
 * Input for enrolling in a single lab group.
 */
export interface EnrollInLabGroupInput {
  enrollmentId: string;
  labGroupId: string;
}


// DTO para el Progreso del Curso
export interface CourseTopic {
  week: number;
  topic: string;
  status: 'pendiente' | 'completado';
}

export interface CourseProgress {
  syllabus: CourseTopic[];
  progressPercentage: number;
}

// DTO para el Reporte de Asistencia
export interface AttendanceDetail {
  date: string;
  status: 'presente' | 'ausente';
  classType: 'teoria' | 'labo';
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  classroomName: string;
}

export interface StudentAttendanceReport {
  enrollmentId: string;
  courseName: string;
  totalAssists: number;
  totalAbsences: number;
  percentage: number;
  details: AttendanceDetail[];
}

export interface GroupGradeStats {
	type: GradeType;
	average: number;
	max: number;
	min: number;
}

export interface GradeWeight {
	type: GradeType;
	weight: number;
}
