import type { ClassType } from './enums';

export interface Classroom {
	id: string;
	name: string;
	type: ClassType;
	capacity: number;
}

export interface ClassroomScheduleEntry {
    title: string;
    type: "FIXED_CLASS" | "RESERVATION";
    day: string;
    startTime: string;
    endTime: string;
    professorName: string;
    date?: string;
}
