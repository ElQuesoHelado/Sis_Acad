import type { UserRole } from './enums';

export interface UserProfile {
	name: string;
	surname: string;
	email: string;
	role: UserRole;
}
