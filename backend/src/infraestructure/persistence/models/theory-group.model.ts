/**
 * @file TypeORM model for the TheoryGroup entity (Course Offering).
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
import { AcademicSemester } from "@/domain/value-objects/academic-semester.vo.js";
import { ClassScheduleModel } from "./class-schedule.model.js";
import { EnrollmentModel } from "./enrollment.model.js";
import { CourseContentModel } from "./course-content.model.js";
import { GradeWeightModel } from "./grade-weight.model.js";

/**
 * Represents a Theory Group (Course Offering) in the system.
 *
 * A TheoryGroup is an instance of a Course taught by a professor in a specific semester.
 * It has a schedule, a letter identifier, and many enrolled students.
 *
 * @extends BaseEntity
 */
@Entity("theory_groups")
export class TheoryGroupModel extends BaseEntity {
  /** Primary key: ID of the theory group. */
  @PrimaryGeneratedColumn("uuid")
  id: string;

  /** Foreign key: ID of the course this group belongs to. */
  @Column({ type: "uuid", name: "course_id" })
  courseId: string;

  /** Many TheoryGroups belong to one Course. */
  @ManyToOne(() => CourseModel, (course) => course.theoryGroups)
  @JoinColumn({ name: "course_id" })
  course: CourseModel;

  /** Foreign key: ID of the professor (User) teaching this group. */
  @Column({ type: "uuid", name: "professor_id" })
  professorId: string;

  /** Many TheoryGroups are taught by one professor (User). */
  @ManyToOne(() => UserModel, (user) => user.theoryGroups)
  @JoinColumn({ name: "professor_id" })
  professor: UserModel;

  /** Semester in which this group is offered (value object with transformer). */
  @Column("varchar", {
    length: 7,
    nullable: false,
    transformer: {
      to: (value: AcademicSemester) => value.value,
      from: (value: string) => AcademicSemester.create(value),
    },
  })
  semester: AcademicSemester;

  /** Letter identifier of the group (e.g., "A", "B"). */
  @Column("char", { length: 1, nullable: false })
  groupLetter: string;

  /** One-to-many relationship: Schedule of this theory group. */
  @OneToMany(() => ClassScheduleModel, (schedule) => schedule.theoryGroup)
  schedules: ClassScheduleModel[];

  /** One-to-many relationship: Enrollments of students in this group. */
  @OneToMany(() => EnrollmentModel, (enrollment) => enrollment.theoryGroup)
  enrollments: EnrollmentModel[];

  /** One-to-many relationship: Syllabus topics (CourseContent) of this group. */
  @OneToMany(() => CourseContentModel, (content) => content.theoryGroup)
  contents: CourseContentModel[];

  /** Grade weights of this group. */
  @OneToMany(() => GradeWeightModel, (weight) => weight.theoryGroup)
  gradeWeights: GradeWeightModel[];

  /** Timestamp when the group was created. */
  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  /** Timestamp when the group was last updated. */
  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;
}
