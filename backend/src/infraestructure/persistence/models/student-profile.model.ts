/**
 * @file TypeORM model for the StudentProfile entity.
 */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
  OneToMany,
} from "typeorm";
import { UserModel } from "./user.model.js";
import { EnrollmentModel } from "./enrollment.model.js";

/**
 * TypeORM model representing a Student Profile.
 *
 * Each student profile is linked to a unique user account and can have
 * multiple enrollments (registrations in courses).
 *
 * @extends BaseEntity
 */
@Entity("student_profiles")
export class StudentProfileModel extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  /** Foreign key linking to the User entity. Each student profile belongs to one user. */
  @Column({ type: "uuid", name: "user_id", unique: true })
  userId: string;

  /** One-to-one relationship with the User entity. Cascades on delete. */
  @OneToOne(() => UserModel, (user) => user.studentProfile, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "user_id" })
  user: UserModel;

  /** Unique student code (e.g., "20230123"). */
  @Column("varchar", {
    length: 8,
    nullable: false,
    unique: true,
    name: "student_code",
  })
  studentCode: string;

  /**
   * One-to-many relationship: a student profile can have multiple enrollments.
   * This allows us to retrieve all course registrations for this student.
   */
  @OneToMany(() => EnrollmentModel, (enrollment) => enrollment.student)
  enrollments: EnrollmentModel[];

  /** Timestamp when the profile was created. */
  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  /** Timestamp when the profile was last updated. */
  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;
}
