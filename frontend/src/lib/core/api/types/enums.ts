export enum UserRole {
	ADMIN = 'administrador',
	SECRETARY = 'secretaria',
	PROFESSOR = 'profesor',
	STUDENT = 'estudiante'
}

export enum ClassType {
	THEORY = 'teoria',
	LAB = 'labo'
}

export enum DayOfWeek {
	MONDAY = 'LUNES',
	TUESDAY = 'MARTES',
	WEDNESDAY = 'MIERCOLES',
	THURSDAY = 'JUEVES',
	FRIDAY = 'VIERNES',
	SATURDAY = 'SABADO',
	SUNDAY = 'DOMINGO'
}

export enum GradeType {
	PARTIAL_1 = 'parcial_1',
	PARTIAL_2 = 'parcial_2',
	PARTIAL_3 = 'parcial_3',
	CONTINUOUS_1 = 'continua_1',
	CONTINUOUS_2 = 'continua_2',
	CONTINUOUS_3 = 'continua_3'
}

export enum AttendanceStatus {
	PRESENT = 'presente',
	ABSENT = 'ausente'
}

export type CourseStatus = 'Aprobado' | 'Desaprobado' | 'En Progreso';
export type LabEnrollmentStatus = 'Matriculado' | 'Sin Matricula' | 'N/A';
