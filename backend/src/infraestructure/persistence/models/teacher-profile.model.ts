/**
 * @file TypeORM model for the TeacherProfile entity.
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
} from "typeorm";
import { UserModel } from "./user.model.js";

/**
 * TypeORM model representing a Teacher Profile.
 *
 * Each teacher profile is linked to a unique user account and contains
 * additional information specific to the teacher, such as their specialization.
 *
 * @extends BaseEntity
 */
@Entity("teacher_profiles")
export class TeacherProfileModel extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  /** Foreign key linking to the User entity. Each teacher profile belongs to one user. */
  @Column({ type: "uuid", name: "user_id", unique: true })
  userId: string;

  /**
   * One-to-one relationship with the User entity.
   * Cascades on delete to ensure the profile is removed if the user is deleted.
   */
  @OneToOne(() => UserModel, (user) => user.teacherProfile, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "user_id" })
  user: UserModel;

  /** Teacher's area of specialization (e.g., "Computer Science"). */
  @Column("varchar", { length: 150, nullable: false })
  specialization: string;

  /** Timestamp when the profile was created. */
  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  /** Timestamp when the profile was last updated. */
  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;
}
