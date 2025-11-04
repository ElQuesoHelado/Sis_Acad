/**
 * @file TypeORM model for the Course entity (Catalog item).
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
import { CourseType } from "../../../domain/enums/index.js";
import { TheoryGroupModel } from "./theory-group.model.js";
import { LabGroupModel } from "./lab-group.model.js";

/**
 * TypeORM model representing a Course in the Catalog.
 *
 * Each course can have multiple TheoryGroups and LabGroups associated with it.
 * This model stores the core attributes of a course, such as code, name,
 * credits, and type.
 *
 * @extends BaseEntity
 */
@Entity("courses")
export class CourseModel extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  /** Unique course code (e.g., "11701101"). */
  @Column("varchar", { length: 8, nullable: false, unique: true })
  code: string;

  /** Full name of the course (e.g., "Introduction to Programming"). */
  @Column("varchar", { length: 255, nullable: false })
  name: string;

  /** Number of academic credits for this course. */
  @Column("int", { nullable: false })
  credits: number;

  /** Type of course (e.g., mandatory, elective) as defined in the CourseType enum. */
  @Column({
    type: "enum",
    enum: CourseType,
    nullable: false,
  })
  type: CourseType;

  /** One-to-many relationship: A course can have multiple TheoryGroups. */
  @OneToMany(() => TheoryGroupModel, (group) => group.course)
  theoryGroups: TheoryGroupModel[];

  /** One-to-many relationship: A course can have multiple LabGroups. */
  @OneToMany(() => LabGroupModel, (group) => group.course)
  labGroups: LabGroupModel[];

  /** Timestamp when the course record was created. */
  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  /** Timestamp when the course record was last updated. */
  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;
}
