/**
 * @file Defines the lifecycle states of a lab reservation.
 *
 * Labs are free by default and become reserved when a reservation is made.
 */
export enum ReservationStatus {
  /**
   * The lab is free and available for reservation.
   * This is the default state.
   */
  FREE = "free",

  /**
   * The lab has been reserved.
   */
  RESERVED = "reservado",
}
