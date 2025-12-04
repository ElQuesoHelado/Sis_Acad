import type { UserRole } from './enums';
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
