/**
 * @file TypeORM model for the CourseContent entity (Syllabus topic).
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
} from "typeorm";
import { TheoryGroupModel } from "./theory-group.model.js";
import { TopicStatus } from "@/domain/enums/topic-status.enum.js";

/**
 * Represents a syllabus topic (CourseContent) for a theory group.
 */
@Entity("course_contents")
export class CourseContentModel extends BaseEntity {
  /** ID of the topic (primary key). */
  @PrimaryGeneratedColumn("uuid")
  id: string;

  /** ID of the theory group this topic belongs to. */
  @Column({ type: "uuid", name: "theory_group_id" })
  theoryGroupId: string;

  /** Relation to the TheoryGroup entity. */
  @ManyToOne(() => TheoryGroupModel, (group) => group.contents)
  @JoinColumn({ name: "theory_group_id" })
  theoryGroup: TheoryGroupModel;

  /** Week number (1–18) of the topic. */
  @Column("int", { nullable: false })
  week: number;

  /** Name of the topic. */
  @Column("varchar", { length: 255, nullable: false, name: "topic_name" })
  topicName: string;

  /** Status of the topic (e.g., pendiente, completado). Default: PENDING. */
  @Column({
    type: "enum",
    enum: TopicStatus,
    nullable: false,
    default: TopicStatus.PENDING,
  })
  status: TopicStatus;

  /** Creation date of the record. */
  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  /** Last update date of the record. */
  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;
}
