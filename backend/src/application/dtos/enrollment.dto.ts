/**
 * @file DTOs for enrollment operations.
 */

/**
 * Input for a single lab group selection.
 */
export interface LabEnrollmentSelectionDto {
  enrollmentId: string; // The ID of the theory enrollment
  labGroupId: string; // The ID of the lab group to join
}
