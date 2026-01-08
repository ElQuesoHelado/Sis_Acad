import type { UserRole, DayOfWeek } from './enums';
import type { TeacherGroup, TeacherScheduleEntry } from './teacher.types';

export interface AdminUserListEntry {
	id: string;
	email: string;
	name: string;
	surname: string;
	role: UserRole;
	status: boolean;
}

export interface AdminTeacherDetails {
	groups: TeacherGroup[];
	schedule: TeacherScheduleEntry[];
}

export interface CourseSummary {
	id: string;
	code: string;
	name: string;
	credits: number;
	type: 'teoria' | 'labo' | 'teoria_labo';
}

// Nueva estructura de horario para lectura (GET)
export interface LabScheduleResponse {
	day: string;       // "MONDAY"
	time: string;      // "08:00-10:00"
	classroom: string; // "Lab 101"
}

// Estructura actualizada del Grupo de Laboratorio
export interface LabGroup {
	id: string;
	courseId: string;
	professorId: string;
	groupLetter: string;
	capacity: number | string; // Manejo flexible por si llega como string
	enrolled: number;          // Antes currentEnrollment
	isFull: boolean;
	schedules: LabScheduleResponse[];
}

// Payload para crear (sigue usando IDs para referencias)
export interface CreateLabScheduleEntry {
	day: string;
	startTime: string;
	endTime: string;
	classroomId: string;
}

export interface CreateLabGroupRequest {
	courseId: string;
	professorId: string;
	groupLetter: string;
	capacity: number | string;
  semester: string;
	schedules: CreateLabScheduleEntry[];
}

export interface UpdateLabCapacityRequest {
	newCapacity: number | string;
}

export interface EnrollmentPeriod {
	startDate: string | null;
	endDate: string | null;
}

export interface SetEnrollmentPeriodRequest {
	period: {
		startDate: string;
		endDate: string;
	};
}
