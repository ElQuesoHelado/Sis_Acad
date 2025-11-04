/**
 * @file DTO for the teacher's group list.
 */
import { type ClassType } from "@/domain/enums/index.js";

/**
 * Represents a single group (theory or lab) taught by a teacher.
 */
export interface TeacherGroupDto {
  /** The unique ID of the TheoryGroup or LabGroup */
  groupId: string;
  courseName: string;
  /** 'teoria' or 'labo' */
  groupType: ClassType;
  groupLetter: string;
}
