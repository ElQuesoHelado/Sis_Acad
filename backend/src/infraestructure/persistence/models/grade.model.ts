/**
 * @file TypeORM model for the Grade entity.
 * @fileoverview Represents a student's grade for a specific enrollment.
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
import { GradeType } from "@/domain/enums/index.js";

/**
 * TypeORM model representing a Grade (score) for a student's enrollment.
 *
 * @note A unique index is applied so that a student cannot have two grades
 * of the same type (e.g., two "partial_1") for the same enrollment.
 */
@Entity("grades")
@Index("UQ_enrollment_grade_type", ["enrollmentId", "type"], { unique: true })
export class GradeModel extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  /** Foreign key: The enrollment this grade belongs to. */
  @Column({ type: "uuid", name: "enrollment_id" })
  enrollmentId: string;

  /** Relationship: Many grades belong to one enrollment. */
  @ManyToOne(() => EnrollmentModel, (enrollment) => enrollment.grades)
  @JoinColumn({ name: "enrollment_id" })
  enrollment: EnrollmentModel;

  /** Type of the grade (e.g., partial_1, continuous_1). */
  @Column({
    type: "enum",
    enum: GradeType,
    nullable: false,
  })
  type: GradeType;

  /** Score value (0–20). Decimal used for precision (e.g., 15.5). */
  @Column("decimal", {
    precision: 4, // total digits (e.g., 12.34)
    scale: 2, // digits after decimal
    nullable: false,
  })
  score: number;

  /** Timestamp when this grade was created. */
  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  /** Timestamp when this grade was last updated. */
  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;
}
