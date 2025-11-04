/**
 * @file TypeORM model for the RoomReservation entity (one-time reservations).
 * @fileoverview Represents a one-time room reservation made by a professor.
 */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { ClassroomModel } from "./classroom.model.js";
import { UserModel } from "./user.model.js";
import { AcademicSemester, TimeOfDay } from "@/domain/value-objects/index.js";
import { DayOfWeek, ReservationStatus } from "@/domain/enums/index.js";

/**
 * TypeORM model representing a one-time reservation of a classroom/lab.
 */
@Entity("room_reservations")
export class RoomReservationModel extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  /** Foreign key: The classroom being reserved. */
  @Column({ type: "uuid", name: "classroom_id" })
  classroomId: string;

  /** Relationship: Many reservations belong to one classroom. */
  @ManyToOne(() => ClassroomModel, (classroom) => classroom.reservations)
  @JoinColumn({ name: "classroom_id" })
  classroom: ClassroomModel;

  /** Foreign key: The professor who made the reservation. */
  @Column({ type: "uuid", name: "professor_id" })
  professorId: string;

  /** Relationship: Many reservations belong to one professor (user). */
  @ManyToOne(() => UserModel, (user) => user.reservations)
  @JoinColumn({ name: "professor_id" })
  professor: UserModel;

  /** Academic semester when the reservation is made (e.g., "2024-I"). */
  @Column("varchar", {
    length: 7,
    nullable: false,
    transformer: {
      to: (value: AcademicSemester) => value.value,
      from: (value: string) => AcademicSemester.create(value),
    },
  })
  semester: AcademicSemester;

  /** Status of the reservation (RESERVED or FREE if canceled). */
  @Column({
    type: "enum",
    enum: ReservationStatus,
    nullable: false,
  })
  status: ReservationStatus;

  // --- TimeSlot mapping ---
  /** Day of the week for this reservation. */
  @Column({ type: "enum", enum: DayOfWeek, nullable: false })
  day: DayOfWeek;

  /** Start time of the reservation. */
  @Column("time", {
    nullable: false,
    name: "start_time",
    transformer: {
      to: (value: TimeOfDay) => value.value,
      from: (value: string) => TimeOfDay.create(value),
    },
  })
  startTime: TimeOfDay;

  /** End time of the reservation. */
  @Column("time", {
    nullable: false,
    name: "end_time",
    transformer: {
      to: (value: TimeOfDay) => value.value,
      from: (value: string) => TimeOfDay.create(value),
    },
  })
  endTime: TimeOfDay;
  // --- End TimeSlot mapping ---

  /** Timestamp when the reservation was created. */
  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  /** Timestamp when the reservation was last updated. */
  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;
}
