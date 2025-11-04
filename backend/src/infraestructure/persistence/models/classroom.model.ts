/**
 * @file TypeORM model for the Classroom entity.
 */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from "typeorm";
import { ClassType } from "@/domain/enums/class-type.enum.js";
import { ClassScheduleModel } from "./class-schedule.model.js";
import { RoomReservationModel } from "./room-reservation.model.js";

/**
 * Represents a classroom (lecture hall or lab) in the system.
 *
 * Each classroom has a type, capacity, and can have multiple
 * scheduled classes or one-time room reservations.
 *
 * @extends BaseEntity
 */
@Entity("classrooms")
export class ClassroomModel extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  /** Name or identifier of the classroom (e.g., "Lab 101"). */
  @Column("varchar", { length: 100, nullable: false, unique: true })
  name: string;

  /** Type of the classroom (THEORY or LAB) as defined in ClassType enum. */
  @Column({
    type: "enum",
    enum: ClassType,
    nullable: false,
  })
  type: ClassType;

  /** Maximum number of students the classroom can accommodate. */
  @Column("int", { nullable: false })
  capacity: number;

  /**
   * One-to-many relationship: A classroom can have multiple fixed class schedules.
   */
  @OneToMany(() => ClassScheduleModel, (schedule) => schedule.classroom)
  schedules: ClassScheduleModel[];

  /**
   * One-to-many relationship: A classroom can have multiple one-time reservations.
   */
  @OneToMany(() => RoomReservationModel, (reservation) => reservation.classroom)
  reservations: RoomReservationModel[];

  /** Timestamp when the classroom record was created. */
  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  /** Timestamp when the classroom record was last updated. */
  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;
}
