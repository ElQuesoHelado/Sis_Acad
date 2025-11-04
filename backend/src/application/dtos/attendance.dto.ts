/**
 * @file DTOs for attendance operations.
 */
import { type AttendanceStatus, type ClassType } from "@/domain/enums/index.js";

/**
 * Represents a single student's attendance record
 * in a bulk request.
 */
export interface AttendanceRecordDto {
  enrollmentId: string;
  status: AttendanceStatus;
}

/**
 * Input DTO for the TakeAttendance use case.
 */
export interface TakeAttendanceDto {
  teacherUserId: string; // Will be injected from the JWT token
  classType: ClassType; // 'teoria' or 'labo'
  groupId: string; // The ID of the TheoryGroup or LabGroup
  date: string; // ISO date string (e.g., "2025-11-03")
  records: AttendanceRecordDto[];
}
