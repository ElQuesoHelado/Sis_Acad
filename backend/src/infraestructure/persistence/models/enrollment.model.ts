/**
 * @file TypeORM model for the Enrollment entity.
 * @fileoverview Represents a student's enrollment in a TheoryGroup and optionally a LabGroup.
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
  OneToMany,
} from "typeorm";
import { StudentProfileModel } from "./student-profile.model.js";
import { TheoryGroupModel } from "./theory-group.model.js";
import { LabGroupModel } from "./lab-group.model.js";
import { GradeModel } from "./grade.model.js";
import { AttendanceModel } from "./attendance.model.js";

/**
 * Represents a student's enrollment in a course offering (TheoryGroup) and optionally a LabGroup.
 * Each enrollment can have multiple grades and attendance records.
 * @extends BaseEntity
 */
@Entity("enrollments")
@Index("UQ_student_theory_group", ["studentId", "theoryGroupId"], {
  unique: true, // A student can enroll only once per TheoryGroup
})
export class EnrollmentModel extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  /** Foreign key: Student enrolling. */
  @Column({ type: "uuid", name: "student_id" })
  studentId: string;

  /** Relationship: Many enrollments belong to one student profile. */
  @ManyToOne(() => StudentProfileModel, (student) => student.enrollments)
  @JoinColumn({ name: "student_id" })
  student: StudentProfileModel;

  /** Foreign key: Theory group in which the student is enrolled. */
  @Column({ type: "uuid", name: "theory_group_id" })
  theoryGroupId: string;

  /** Relationship: Many enrollments belong to one TheoryGroup. */
  @ManyToOne(() => TheoryGroupModel, (group) => group.enrollments)
  @JoinColumn({ name: "theory_group_id" })
  theoryGroup: TheoryGroupModel;

  /** Optional foreign key: Lab group for the student. */
  @Column({ type: "uuid", name: "lab_group_id", nullable: true })
  labGroupId: string | null;

  /** Relationship: Many enrollments belong to one LabGroup (optional). */
  @ManyToOne(() => LabGroupModel, (group) => group.enrollments, {
    nullable: true,
  })
  @JoinColumn({ name: "lab_group_id" })
  labGroup: LabGroupModel | null;

  /** Relationship: An enrollment can have multiple grades. */
  @OneToMany(() => GradeModel, (grade) => grade.enrollment)
  grades: GradeModel[];

  /** Relationship: An enrollment can have multiple attendance records. */
  @OneToMany(() => AttendanceModel, (attendance) => attendance.enrollment)
  attendances: AttendanceModel[];

  /** Timestamp when this enrollment was created. */
  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  /** Timestamp when this enrollment was last updated. */
  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;
}
