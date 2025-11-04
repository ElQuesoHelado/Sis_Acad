/**
 * @file TypeORM model for the LabGroup entity (Lab Course Offering).
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
  OneToMany,
} from "typeorm";
import { CourseModel } from "./course.model.js";
import { UserModel } from "./user.model.js";
import { ClassScheduleModel } from "./class-schedule.model.js";
import { EnrollmentModel } from "./enrollment.model.js";

/**
 * Represents a Lab Group (practical course offering) in the system.
 *
 * A LabGroup is an instance of a Course with a capacity limit, assigned to a professor,
 * and optionally linked to a schedule. Students enroll in lab groups through enrollments.
 *
 * @extends BaseEntity
 */
@Entity("lab_groups")
export class LabGroupModel extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  /** Foreign key to the Course this lab group belongs to. */
  @Column({ type: "uuid", name: "course_id" })
  courseId: string;

  /** Relationship: Many LabGroups belong to one Course. */
  @ManyToOne(() => CourseModel, (course) => course.labGroups)
  @JoinColumn({ name: "course_id" })
  course: CourseModel;

  /** Foreign key to the professor teaching this lab group. */
  @Column({ type: "uuid", name: "professor_id" })
  professorId: string;

  /** Relationship: Many LabGroups are taught by one professor (User). */
  @ManyToOne(() => UserModel, (user) => user.labGroups)
  @JoinColumn({ name: "professor_id" })
  professor: UserModel;

  /** Letter identifier for the lab group (e.g., "A", "B"). */
  @Column("char", { length: 1, nullable: false, name: "group_letter" })
  groupLetter: string;

  /** Maximum number of students allowed in this lab group. */
  @Column("int", { nullable: false })
  capacity: number;

  /** Current number of enrolled students. */
  @Column("int", { nullable: false, default: 0, name: "current_enrollment" })
  currentEnrollment: number;

  /** One-to-one relationship with ClassSchedule for this lab group. */
  @OneToMany(() => ClassScheduleModel, (schedule) => schedule.labGroup)
  schedules: ClassScheduleModel[];

  /**
   * One-to-many relationship: A LabGroup can have many student enrollments.
   */
  @OneToMany(() => EnrollmentModel, (enrollment) => enrollment.labGroup)
  enrollments: EnrollmentModel[];

  /** Timestamp when the lab group was created. */
  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  /** Timestamp when the lab group was last updated. */
  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;
}
