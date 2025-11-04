import type { CourseStatus, DayOfWeek, GradeType, LabEnrollmentStatus } from './enums';

/**
 * Represents a course in a student's semester overview.
 * Returned by GET /api/student/courses/{semester}.
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
 * Represents an individual grade entry within a course.
 */
export interface GradeOutput {
	id: string;
	type: GradeType;
	typeName: string;
	score: number;
}

/**
 * Detailed grade information for a student's course in a given semester.
 * Returned by GET /api/student/grades/{semester}.
 */
export interface StudentCourseGrades {
	enrollmentId: string;
	courseName: string;
	professorName: string;
	grades: GradeOutput[];
	average: number | null;
	status: CourseStatus;
}

/**
 * Represents a scheduled class for a student's weekly timetable.
 * Returned by GET /api/student/schedule/{semester}.
 */
export interface StudentScheduleEntry {
	courseName: string;
	groupType: 'Teoria' | 'Lab';
	groupLetter: string;
	day: DayOfWeek;
	startTime: string; // Format: "HH:MM"
	endTime: string; // Format: "HH:MM"
	classroomName: string;
	professorName: string;
}

/**
 * Represents an available laboratory group for enrollment.
 * Returned by GET /api/student/enrollment/{enrollmentId}/available-labs.
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
 * Request payload for enrolling in multiple lab groups.
 * Used in POST /api/student/enroll-labs.
 */
export interface EnrollInLabGroupsInput {
	selections: LabEnrollmentSelection[];
}

/**
 * Request payload for enrolling in a single lab group.
 * Used in PATCH /api/student/enroll-lab.
 */
export interface EnrollInLabGroupInput {
	enrollmentId: string;
	labGroupId: string;
}
