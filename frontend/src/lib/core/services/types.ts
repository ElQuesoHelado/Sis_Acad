// --- Authentication ---
export interface LoginRequest {
	email: string;
	password: string;
}

export interface LoginResponse {
	token: string;
	user: UserSummary;
}

export interface UserSummary {
	id: string;
	email: string;
	role: UserRole;
	name: string;
	surname: string;
}

// --- Users (Generic, Students, Professors) ---
export type UserRole = 'student' | 'professor' | 'secretary' | 'admin' | '';

export interface UserResponse {
	id: string;
	email: string;
	role: UserRole;
	name?: string | null;
	surname?: string | null;
	birthdate?: string | null;
	picture?: string | null;
	status?: boolean | null;
}

export interface CreateUserRequest {
	email: string;
	password: string;
	name: string;
	surname: string;
	birthdate: string;
	status?: boolean;
}

export interface UpdateUserStatusRequest {
	status: boolean;
}

export interface DeleteUserResponse {
	deletedUserId: string;
	message: string;
}

export interface UpdateUserStatusResponse {
	id: string;
	status: boolean;
	message: string;
}

// --- Courses ---
export type CourseType = 'THEORY' | 'LAB' | 'THEORY_LAB'; // From CourseType enum

export interface CourseResponse {
	id: string;
	code: string;
	name: string;
	description: string;
	credits: number;
	semester: string;
	courseType: CourseType;
	theoryWeightPercentage?: number | null; // Can be null
	labWeightPercentage?: number | null; // Can be null
	syllabusUrl?: string | null; // Can be null
}

export interface CreateCourseRequest {
	code: string;
	name: string;
	description: string;
	credits: number;
	semester: string;
	courseType: CourseType;
	theoryWeightPercentage?: number; // Optional
	labWeightPercentage?: number; // Optional
}

export interface UploadSyllabusRequest {
	courseId: string;
	syllabusUrl: string;
}

export interface UploadSyllabusResponse {
	syllabusUrl: string;
	message: string;
}

// --- Course Content (Specific to Reports) ---
// Based on ReportService logic in backend
export interface CourseContentTopic {
	week: number;
	topic: string;
	completed: boolean;
}

export interface CourseReportContent {
	topics: CourseContentTopic[];
	completedWeeks: number;
	totalWeeks: number;
}

export interface StudentProgressContent {
	week: number;
	topic: string;
	completed: boolean;
}

// --- Enrollments ---
export type EnrollmentStatus = 'ACTIVE' | 'INACTIVE' | 'COMPLETED' | 'DROPPED'; // From EnrollmentStatus enum

export interface EnrollmentResponse {
	id: string;
	studentId: string;
	courseId: string;
	labGroupId?: string | null; // Can be null
	enrollmentDate: string; // ISO 8601 date-time string
	status: EnrollmentStatus;
}

export interface CreateEnrollmentRequest {
	studentId: string;
	courseId: string;
	labGroupId?: string; // Optional, might be required if courseType involves LAB
}

export interface BulkEnrollmentRequest {
	courseId: string;
	studentIds: string[];
	autoAssignLabs?: boolean; // Defaults to false in backend service
}

export interface BulkEnrollmentError {
	studentId: string;
	error: string;
}

export interface BulkEnrollmentResponse {
	message: string;
	enrolled: number;
	errors: BulkEnrollmentError[];
}

// --- Grades ---
// GradeType seems flexible string in backend DTO, but could be enum
export type GradeType = 'midterm' | 'final' | 'assignment' | 'quiz' | 'lab' | string;

export interface GradeResponse {
	id: string;
	studentId: string;
	courseId: string;
	gradeType: GradeType;
	score: number;
	maxScore: number;
	weight: number; // Stored as decimal (0-1) in DB, DTO might expect percentage (0-100)? Check controller
	examDate: string; // ISO 8601 date-time string
	comments?: string | null;
}

export interface EnterGradeRequest {
	studentId: string;
	courseId: string;
	gradeType: GradeType;
	score: number;
	maxScore: number;
	weight: number; // Expect percentage 0-100 here based on controller validation
	examDate: string; // 'YYYY-MM-DD' format expected by DTO
	comments?: string;
}

// Structure within StudentGradesResponse and CourseGradeReportItem
export interface GradeEntry {
	gradeType: GradeType;
	score: number;
	maxScore: number;
	percentage: string; // e.g., "85.00%"
	weight: number; // Percentage 0-100
	examDate: string; // ISO 8601 date-time string
}

export interface StudentGradesResponse {
	grades: GradeEntry[]; // Use the detailed GradeEntry structure
	finalGrade: string; // e.g., "88.50" (number as string) or letter grade
}

export interface CourseGradeReportItem {
	studentId: string;
	studentName: string;
	grades: GradeEntry[]; // Use the detailed GradeEntry structure
	finalGrade: string;
}

export interface GradeStatistics {
	average: string; // Number as string e.g., "75.50"
	highest: string; // Number as string
	lowest: string; // Number as string
	totalStudents: number;
	passRate: string; // e.g., "80.00%"
}

// --- Attendance ---
export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE'; // From AttendanceStatus enum
export type ClassType = 'THEORY' | 'LAB'; // From ClassType enum
export type ClassMode = 'IN_PERSON' | 'REMOTE'; // From ClassMode enum

export interface AttendanceRecord {
	id: string;
	classDate: string; // ISO 8601 date-time string
	classType: ClassType;
	status: AttendanceStatus;
	weekNumber: number;
	classMode: ClassMode;
	notes?: string | null;
}

export interface AttendanceSummary {
	totalClasses: number;
	present: number;
	absent: number;
	late: number;
	attendancePercentage: string; // e.g., "95.00%"
	inPersonClasses: number;
	remoteClasses: number;
}

export interface StudentAttendanceResponse {
	attendances: AttendanceRecord[];
	summary: AttendanceSummary;
}

export interface StudentAttendanceMark {
	studentId: string;
	status: AttendanceStatus;
}

export interface MarkAttendanceRequest {
	courseId: string;
	labGroupId?: string;
	classDate: string; // 'YYYY-MM-DD'
	classType: ClassType;
	weekNumber: number;
	attendances: StudentAttendanceMark[];
	// classMode is determined on the backend based on IP
}

export interface AttendanceMarkResponse {
	message: string;
	count: number;
	classMode: ClassMode;
	professorIP: string;
}

export interface MarkAllAbsentRequest {
	courseId: string;
	labGroupId?: string;
	classDate: string; // 'YYYY-MM-DD'
	classType: ClassType;
	weekNumber: number;
}

// MarkAllAbsent response uses AttendanceMarkResponse schema in backend controller
export type MarkAllAbsentResponse = AttendanceMarkResponse;

export interface CourseAttendanceReportItem {
	studentId: string;
	studentName: string;
	present: number;
	absent: number;
	late: number;
	total: number;
	inPersonClasses: number;
	remoteClasses: number;
	attendancePercentage: string; // e.g., "90.00%"
}

// --- Labs ---
export interface LabGroupResponse {
	id: string;
	courseId: string;
	groupNumber: number;
	labProfessorId: string;
	capacity: number;
	schedule: string;
	currentEnrollment: number;
}

export interface CreateLabGroupRequest {
	courseId: string;
	groupNumber: number;
	labProfessorId: string;
	schedule: string;
	capacity: number; // Required in backend DTO validation
}

export type ReservationStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED'; // From ReservationStatus enum

export interface LabReservationResponse {
	id: string;
	professorId: string;
	labGroupId: string;
	reservationDate: string; // ISO 8601 date-time string
	startTime: string; // "HH:mm"
	endTime: string; // "HH:mm"
	purpose: string;
	status: ReservationStatus;
	weekNumber: number;
}

export interface CreateLabReservationRequest {
	labGroupId: string;
	reservationDate: string; // 'YYYY-MM-DD'
	startTime: string; // "HH:mm"
	endTime: string; // "HH:mm"
	purpose: string;
	weekNumber: number;
}

// --- Reports ---
// Structure within CourseReportResponse.students.attendance
export interface CourseReportStudentAttendance {
	attendancePercentage: string; // e.g., "90.00%"
	absent: number;
	present: number;
	totalClasses: number;
	// late count is missing here based on backend report generation logic
}

// Structure within CourseReportResponse.students.grades
export interface CourseReportStudentGradeEntry {
	// Backend report seems to aggregate, maybe final grade only?
	// Let's assume it maps to GradeEntry for now, but might need adjustment
	// based on actual API output. Swagger definition is empty.
	// Revisit after testing API. For now, using GradeEntry.
	gradeType: GradeType;
	score: number;
	maxScore: number;
	percentage: string;
	weight: number;
	examDate: string;
}

export interface CourseReportResponse {
	courseId: string;
	totalStudents: number;
	courseProgress: string; // e.g., "60.00%"
	courseContent: CourseReportContent;
	students: Array<{
		studentId: string;
		studentName: string;
		studentCode: string; // From User entity, not enrollment specific
		attendance: CourseReportStudentAttendance;
		grades: {
			finalGrade: string; // e.g., "85.50"
			entries: GradeEntry[]; // Assuming entries are included, check API response
		};
	}>;
	statistics: {
		gradeDistribution: {
			A: number; // Count of students with grade >= 90
			B: number; // Count of students with grade 80-89
			C: number; // Count of students with grade 70-79
			D: number; // Count of students with grade 60-69
			F: number; // Count of students with grade < 60
		};
		attendanceDistribution: {
			excellent: number; // Count >= 90%
			good: number; // Count 75-89%
			average: number; // Count 60-74%
			poor: number; // Count < 60%
		};
	};
}

// Structure within StudentProgressReportResponse.attendance.records
export interface StudentProgressAttendanceRecord {
	// Backend report service seems to use basic info, confirm actual output
	week: number;
	date: string; // 'YYYY-MM-DD'
	status: AttendanceStatus;
}

export interface StudentProgressReportResponse {
	student: {
		id: string;
		name: string;
		code: string; // User's email/code
	};
	course: {
		id: string;
		name: string;
		code: string; // Course code
	};
	attendance: {
		totalClasses: number;
		present: number;
		absent: number;
		late: number;
		percentage: string; // e.g., "95.00%"
		records: StudentProgressAttendanceRecord[]; // Simple records
	};
	grades: {
		finalGrade: string; // e.g., "88.50"
		entries: GradeEntry[]; // Use the detailed GradeEntry
	};
	progress: {
		completedWeeks: number;
		totalWeeks: number;
		percentage: string; // e.g., "75.00%"
		content: StudentProgressContent[];
	};
}

// --- Generic/Utility Types ---
export interface SuccessMessageResponse {
	message: string;
}

export interface ApiErrorResponse {
	message: string;
	statusCode?: number;
	details?: unknown;
}
