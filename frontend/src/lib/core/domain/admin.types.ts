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
export interface CourseSummary {
  id: string;
  code: string;
  name: string;
  credits: number;
  type: 'teoria' | 'labo' | 'teoria_labo';
}

export interface LabGroup {
  id: string;
  courseId: string;
  professorId: string;
  groupLetter: string;
  capacity: number;
  currentEnrollment: number;
}

export interface CreateLabGroupRequest {
  courseId: string;
  professorId: string;
  groupLetter: string;
  capacity: number;
}

export interface UpdateLabCapacityRequest {
  newCapacity: number;
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
