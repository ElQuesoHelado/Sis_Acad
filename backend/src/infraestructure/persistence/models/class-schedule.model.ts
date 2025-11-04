/**
 * @file TypeORM model for the ClassSchedule entity (Fixed Schedule).
 * @fileoverview Represents fixed schedules for classrooms, linking Theory or Lab groups to specific days and times.
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
import { ClassroomModel } from "./classroom.model.js";
import { TheoryGroupModel } from "./theory-group.model.js";
import { LabGroupModel } from "./lab-group.model.js";
import { AcademicSemester, TimeOfDay } from "@/domain/value-objects/index.js";
import { DayOfWeek } from "@/domain/enums/index.js";

/**
 * Represents a fixed schedule for a classroom.
 *
 * Each schedule links a classroom to either a TheoryGroup or LabGroup for a given
 * semester, day of the week, and start/end times.
 *
 * @extends BaseEntity
 */
@Entity("class_schedules")
@Index("UQ_schedule_slot", ["classroomId", "semester", "day", "startTime"], {
  unique: true,
})
export class ClassScheduleModel extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  /** Foreign key: Classroom for this schedule. */
  @Column({ type: "uuid", name: "classroom_id" })
  classroomId: string;

  /** Relationship: Many schedules belong to one classroom. */
  @ManyToOne(() => ClassroomModel, (classroom) => classroom.schedules)
  @JoinColumn({ name: "classroom_id" })
  classroom: ClassroomModel;

  /** Semester in which this schedule is active. */
  @Column("varchar", {
    length: 7,
    nullable: false,
    transformer: {
      to: (value: AcademicSemester) => value.value,
      from: (value: string) => AcademicSemester.create(value),
    },
  })
  semester: AcademicSemester;

  /** Day of the week for this schedule. */
  @Column({
    type: "enum",
    enum: DayOfWeek,
    nullable: false,
  })
  day: DayOfWeek;

  /** Start time of the class. */
  @Column("time", {
    nullable: false,
    name: "start_time",
    transformer: {
      to: (value: TimeOfDay) => value.value,
      from: (value: string) => {
        return TimeOfDay.create(value.substring(0, 5));
      },
    },
  })
  startTime: TimeOfDay;

  /** End time of the class. */
  @Column("time", {
    nullable: false,
    name: "end_time",
    transformer: {
      to: (value: TimeOfDay) => value.value,
      from: (value: string) => {
        return TimeOfDay.create(value.substring(0, 5));
      },
    },
  })
  endTime: TimeOfDay;

  /** Optional foreign key: Theory group assigned to this schedule. */
  @Column({ type: "uuid", name: "theory_group_id", nullable: true })
  theoryGroupId: string | null;

  /** Relationship: One-to-one with a TheoryGroup. */
  @ManyToOne(() => TheoryGroupModel, (group) => group.schedules, {
    nullable: true,
  })
  @JoinColumn({ name: "theory_group_id" })
  theoryGroup: TheoryGroupModel | null;

  /** Optional foreign key: Lab group assigned to this schedule. */
  @Column({ type: "uuid", name: "lab_group_id", nullable: true })
  labGroupId: string | null;

  /** Relationship: One-to-one with a LabGroup. */
  @ManyToOne(() => LabGroupModel, (group) => group.schedules, {
    nullable: true,
  })
  @JoinColumn({ name: "lab_group_id" })
  labGroup: LabGroupModel | null;

  /** Timestamp when this schedule was created. */
  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  /** Timestamp when this schedule was last updated. */
  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;
}
