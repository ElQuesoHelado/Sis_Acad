/**
 * @file TypeORM model for the Attendance entity.
 * @fileoverview Represents an attendance record for a student enrollment.
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
  Index,
} from "typeorm";
import { EnrollmentModel } from "./enrollment.model.js";
import { AttendanceStatus, ClassType } from "@/domain/enums/index.js";

/**
 * TypeORM model representing a student's attendance record.
 *
 * @note A unique index ensures that a student cannot have more than one attendance
 * record for the same date and class type (e.g., theory or lab).
 */
@Entity("attendances")
@Index("UQ_enrollment_date_type", ["enrollmentId", "date", "classType"], {
  unique: true,
})
export class AttendanceModel extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  /** Foreign key: The enrollment this attendance record belongs to. */
  @Column({ type: "uuid", name: "enrollment_id" })
  enrollmentId: string;

  /** Relationship: Many attendance records belong to one enrollment. */
  @ManyToOne(() => EnrollmentModel, (enrollment) => enrollment.attendances)
  @JoinColumn({ name: "enrollment_id" })
  enrollment: EnrollmentModel;

  /** The date the attendance was recorded (stored as YYYY-MM-DD). */
  @Column("date", { nullable: false })
  date: Date;

  /** Attendance status (present or absent). */
  @Column({
    type: "enum",
    enum: AttendanceStatus,
    nullable: false,
  })
  status: AttendanceStatus;

  /** Type of class (theory or lab). */
  @Column({
    type: "enum",
    enum: ClassType,
    nullable: false,
    name: "class_type",
  })
  classType: ClassType;

  /** Timestamp when the record was created. */
  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  /** Timestamp when the record was last updated. */
  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;
}
