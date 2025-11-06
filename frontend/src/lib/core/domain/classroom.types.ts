import type { ClassType } from './enums';

export interface Classroom {
	id: string;
	name: string;
	type: ClassType;
	capacity: number;
}
