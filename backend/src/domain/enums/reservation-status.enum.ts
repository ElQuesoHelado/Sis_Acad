/**
 * @file Defines the lifecycle states of a room reservation.
 */
export enum ReservationStatus {
  /**
   * The reservation is active and upcoming.
   */
  RESERVED = "reservado",

  /**
   * The reservation was actively cancelled by the user.
   */
  FREE = "free",

  /**
   * The reservation date/time has passed.
   */
  COMPLETED = "completado",
}
