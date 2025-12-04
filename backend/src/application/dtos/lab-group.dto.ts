/**
 * @file DTO for available lab groups.
 */

/**
 * Represents a lab group available for enrollment.
 */
export interface AvailableLabGroupDto {
  id: string;
  groupLetter: string;
  capacity: number;
  currentEnrollment: number;
  isFull: boolean;
  schedules: {
    day: string;
    time: string;
    classroom: string;
  }[];
}
